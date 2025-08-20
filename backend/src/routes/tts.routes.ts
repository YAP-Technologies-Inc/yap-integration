import { Router } from "express";
import { ELEVENLABS_API_KEY } from "../config/env.js";

const router = Router();

// POST //elevenlabs-tts
router.post("/elevenlabs-tts", async (req, res) => {
  try {
    const { text, voiceId = process.env.ELEVENLABS_VOICE_ID } = req.body || {};
    if (!text) return res.status(400).json({ error: "Text is required" });

    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": String(ELEVENLABS_API_KEY),
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.5 },
        }),
      },
    );

    if (!r.ok) throw new Error(`ElevenLabs API error: ${r.status}`);
    const audioBuffer = await r.arrayBuffer();

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.byteLength,
    });
    res.send(Buffer.from(audioBuffer));
  } catch (err: any) {
    console.error("ElevenLabs TTS error:", err);
    res.status(500).json({ error: "Failed to generate audio" });
  }
});

export default router;
