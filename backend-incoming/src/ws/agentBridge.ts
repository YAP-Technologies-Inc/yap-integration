import { Server as HttpServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { ELEVENLABS_AGENT_ID, ELEVENLABS_API_KEY, OPENAI_API_KEY } from "../config/env.js";
import { wrapPcmAsWav } from "../services/audio.js";

export function attachAgentBridge(server: HttpServer) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    socket.on("error", (err) => console.error("[upgrade] socket error:", err.message));
    if (!req.url || !req.url.startsWith("/api/agent-ws")) return socket.destroy();
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
  });

  async function getSignedUrl(agentId: string) {
    const url = `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`;
    const r = await fetch(url, { headers: { "xi-api-key": String(ELEVENLABS_API_KEY) } });
    if (!r.ok) throw new Error(`Signed URL failed: ${r.status} ${await r.text()}`);
    const data: any = await r.json();
    if (!data?.signed_url) throw new Error("No signed_url in response");
    return data.signed_url;
  }

  async function transcribeWavToText_OpenAI(wavBuffer: Buffer) {
    if (!OPENAI_API_KEY) return null;
    try {
      const form = new FormData();
      form.append("file", new Blob([wavBuffer], { type: "audio/wav" }), "turn.wav");
      form.append("model", "whisper-1");
      const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: form
      });
      if (!r.ok) return null;
      const j: any = await r.json();
      return (j.text || "").trim();
    } catch {
      return null;
    }
  }

  wss.on("connection", async (client) => {
    const tag = `[agent-ws:${Date.now()}]`;

    if (!ELEVENLABS_API_KEY || !ELEVENLABS_AGENT_ID) {
      client.send(JSON.stringify({ type: "error", error: "Missing ELEVENLABS env vars" }));
      client.close();
      return;
    }

    let elWs: WebSocket | null = null;
    const SILENCE_MS = 900;
    const HARD_LIMIT_MS = 20000;
    let collecting = false;
    let turnChunks: Buffer[] = [];
    let silenceTimer: NodeJS.Timeout | null = null;
    let hardTimer: NodeJS.Timeout | null = null;

    function clearTimers() {
      if (silenceTimer) clearTimeout(silenceTimer), (silenceTimer = null);
      if (hardTimer) clearTimeout(hardTimer), (hardTimer = null);
    }
    function startTurn() {
      clearTimers();
      collecting = true;
      turnChunks.length = 0;
      hardTimer = setTimeout(() => finalizeTurn("hard-limit"), HARD_LIMIT_MS);
    }
    function bumpSilence() {
      if (silenceTimer) clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => finalizeTurn("silence"), SILENCE_MS);
    }
    async function finalizeTurn(_reason: string) {
      if (!collecting) return;
      clearTimers();
      collecting = false;
      if (turnChunks.length === 0) return;

      const wav = wrapPcmAsWav(turnChunks.splice(0, turnChunks.length));

      if (client.readyState === WebSocket.OPEN) {
        client.send(wav, { binary: true });
        client.send(JSON.stringify({ type: "turn_end" }));
      }

      (async () => {
        let text = await transcribeWavToText_OpenAI(wav);
        if (!text) text = "[voice reply]";
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "ai_text", text }));
        }
      })();
    }

    async function connectEL() {
      const signedUrl = await getSignedUrl(String(ELEVENLABS_AGENT_ID));
      const ws = new WebSocket(signedUrl);
      elWs = ws;

      ws.on("open", () => console.log(`${tag} EL ws connected`));

      elWs.on("message", (raw) => {
        try {
          const evt = JSON.parse(raw.toString());
          if (evt?.type === "conversation_initiation_metadata") {
            client.send(JSON.stringify({ type: "meta", meta: evt }));
            return;
          }
          if (evt?.type === "audio") {
            const b64 =
              evt.audio_event?.audio_base_64 ||
              evt.audio_base_64 ||
              evt.audio;
            if (b64) {
              if (!collecting) startTurn();
              const buf = Buffer.from(b64, "base64");
              turnChunks.push(buf);
              bumpSilence();
            }
            return;
          }
          if (evt?.type === "interruption") {
            finalizeTurn("interruption");
            return;
          }
        } catch {
          // ignore non-JSON frames
        }
      });

      ws.on("close", (code, reason) => {
        console.log(`${tag} EL ws closed: ${code} ${reason}`);
        finalizeTurn("el-close");
        elWs = null;
      });

      ws.on("error", () => {
        finalizeTurn("el-error");
      });
    }

    try {
      await connectEL();
    } catch {
      client.send(JSON.stringify({ type: "error", error: "Failed to reach agent" }));
    }

    client.on("message", async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg?.type === "user_text" && typeof msg.text === "string" && msg.text.trim()) {
          if (!elWs || elWs.readyState !== WebSocket.OPEN) {
            try { await connectEL(); } catch {}
          }
          if (elWs && elWs.readyState === WebSocket.OPEN) {
            startTurn();
            elWs.send(JSON.stringify({ type: "user_message", text: msg.text }));
          } else {
            client.send(JSON.stringify({ type: "error", error: "Agent not ready" }));
          }
        } else if (msg?.type === "close") {
          client.close();
        }
      } catch {
        // ignore bad messages
      }
    });

    client.on("close", () => { clearTimers(); try { elWs?.close(); } catch {} });
    client.on("error", () => { clearTimers(); try { elWs?.close(); } catch {} });
  });
}
