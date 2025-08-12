require("dotenv").config();
const OpenAI = require("openai");
const express = require("express");
const fsSync = require("fs");
const cors = require("cors");
const flowglad = require("@flowglad/server");
const bip39 = require("bip39");
const ethers = require("ethers");
const nodeMailer = require("nodemailer");
const {
  JsonRpcProvider,
  Wallet,
  Contract,
  parseUnits,
  isAddress,
} = require("ethers");
const crypto = require("crypto");
const { Pool } = require("pg");
const db = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});
const artifact = require("./abi/YapToken.json");
const tokenAbi = artifact.abi;

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});
const bcrypt = require("bcryptjs"); // Add at the top if you want to hash passwords
const { assessPronunciation } = require("./azurePronunciation");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const http = require("http");
const { WebSocketServer } = require("ws");
const WebSocket = require("ws");

const fs = require("fs");
const path = require("path");
const upload = multer({ dest: "uploads/" });

const SEI_RPC = "https://evm-rpc-testnet.sei-apis.com";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;
const provider = new JsonRpcProvider(SEI_RPC);
const wallet = new Wallet(PRIVATE_KEY, provider);
const ELEVENLABS_AGENT_ID = process.env.ELEVENLABS_AGENT_ID;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);

// Endpoint to redeem YAP token
app.post("/api/redeem-yap", async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress || !isAddress(walletAddress)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid wallet address" });
    }

    const token = new Contract(TOKEN_ADDRESS, tokenAbi, wallet);
    const tx = await token.transfer(walletAddress, parseUnits("1", 18));
    await tx.wait();

    console.log(`Sent 1 YAP to ${walletAddress}: ${tx.hash}`);
    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    console.error("YAP transfer failed:", err);
    res.status(500).json({ success: false, error: "Transfer failed" });
  }
});

// Function to send YAP token to a user's wallet
// This is called when a user completes a lesson
// It checks if the wallet address is valid, sends 1 YAP token, and returns
async function sendYAPToWallet(toAddress) {
  if (!isAddress(toAddress)) {
    throw new Error(`Invalid wallet address: ${toAddress}`);
  }
  const token = new Contract(TOKEN_ADDRESS, tokenAbi, wallet);
  const tx = await token.transfer(toAddress, parseUnits("1", 18));
  await tx.wait();
  console.log(`Sent 1 YAP to ${toAddress}, txHash=${tx.hash}`);
  return tx.hash;
}
// Endpoint to complete a lesson
// This will:
// 1) Check if the user has already completed this lesson
// 2) Send the YAP token to their wallet address
// 3) Record the completion in the user_lessons table
// 4) Respond with the transaction hash

// index.js (Express)

app.post("/api/complete-lesson", async (req, res) => {
  const { userId, walletAddress, lessonId } = req.body;

  try {
    // 1) Prevent double‑completions
    const { rows: already } = await db.query(
      `SELECT 1
         FROM user_lessons
        WHERE user_id   = $1
          AND lesson_id = $2`,
      [userId, lessonId]
    );
    if (already.length) {
      return res.status(400).json({ error: "Lesson already completed." });
    }

    // 2) Send 1 YAP on‑chain
    const txHash = await sendYAPToWallet(walletAddress);

    // 3) Record in user_lessons
    await db.query(
      `INSERT INTO user_lessons
           (user_id, lesson_id, completed_at, tx_hash)
         VALUES ($1, $2, NOW(), $3)`,
      [userId, lessonId, txHash]
    );

    // 4) Upsert into user_stats
    await db.query(
      `INSERT INTO user_stats
           (user_id, token_balance, current_streak, highest_streak, total_yap_earned)
         VALUES ($1, 1, 0, 0, 1)
         ON CONFLICT (user_id) DO UPDATE
           SET token_balance    = user_stats.token_balance   + 1,
               total_yap_earned = user_stats.total_yap_earned + 1,
               updated_at       = NOW()`,
      [userId]
    );

    // 5) Return success
    res.json({ success: true, txHash });
  } catch (err) {
    console.error("Lesson completion error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/user-lessons/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await db.query(
      "SELECT lesson_id FROM user_lessons WHERE user_id = $1",
      [userId]
    );
    const completedLessons = result.rows.map((row) => row.lesson_id);
    res.json({ completedLessons });
  } catch (err) {
    console.error("Error fetching user lessons:", err);
    res.status(500).json({ error: "Failed to fetch completed lessons" });
  }
});

// GET /api/user-stats/:userId
app.get("/api/user-stats/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await db.query(
      `SELECT token_balance,
              current_streak,
              highest_streak,
              total_yap_earned,
              updated_at
       FROM user_stats
       WHERE user_id = $1`,
      [userId]
    );
    if (rows.length === 0) {
      // Can auto create stats if not found if we need to
      return res.status(404).json({ error: "Stats not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching user stats:", err);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
});

app.post("/api/user-stats/:userId/streak", async (req, res) => {
  const { userId } = req.params;
  const { currentStreak, highestStreak } = req.body;

  try {
    await db.query(
      `UPDATE user_stats
         SET current_streak = $2,
             highest_streak = GREATEST(highest_streak, $3),
             updated_at     = NOW()
       WHERE user_id = $1`,
      [userId, currentStreak, highestStreak]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating streak:", err);
    res.status(500).json({ error: "Failed to update streak" });
  }
});

// Set your Flowglad secret key (from your dashboard)
flowglad.secretKey = process.env.FLOWGLAD_SECRET_KEY;

// Example endpoint to create a payment session
app.post("/api/create-payment-session", async (req, res) => {
  try {
    // You may want to get amount, user info, etc. from req.body
    const session = await flowglad.createSession({
      amount: 1000, // e.g., $10.00
      currency: "usd",
      // ...other required fields
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Demo signup endpoint for mobile app
app.post("/api/auth/secure-signup", async (req, res) => {
  try {
    const { user_id, name, language_to_learn } = req.body;
    if (!user_id || !name || !language_to_learn) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    // 1) Upsert into users
    await db.query(
      `INSERT INTO users (user_id, name, language_to_learn)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id)
         DO UPDATE SET name = EXCLUDED.name,
                       language_to_learn = EXCLUDED.language_to_learn`,
      [user_id, name, language_to_learn]
    );

    // 2) Initialize stats row with sensible defaults
    await db.query(
      `INSERT INTO user_stats 
         (user_id, token_balance, current_streak, highest_streak, total_yap_earned)
       VALUES ($1, 0, 1, 1, 0)
       ON CONFLICT (user_id) DO NOTHING`,
      [user_id]
    );

    return res.json({
      success: true,
      user_id,
      message: "User (and stats) saved to DB successfully",
    });
  } catch (err) {
    console.error("Secure signup error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required." });
    }

    // Find user by email
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password." });
    }
    const user = result.rows[0];

    // Use bcrypt to compare password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password." });
    }

    // Generate a token (for demo, random string)
    const token = crypto.randomBytes(32).toString("hex");

    res.json({
      success: true,
      userId: user.user_id,
      token,
      name: user.name,
      email: user.email,
      sei_address: user.sei_address,
      eth_address: user.eth_address,
      message: "Login successful!",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// /api/profile/:userId
app.get("/api/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await db.query(
      "SELECT name, language_to_learn, created_at FROM users WHERE user_id = $1",
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Pronunciation Assessment Endpoint
app.post("/api/pronunciation-assessment", async (req, res) => {
  try {
    const { audioPath, referenceText } = req.body;
    if (!audioPath || !referenceText) {
      return res
        .status(400)
        .json({ error: "audioPath and referenceText are required." });
    }
    const result = await assessPronunciation(audioPath, referenceText);
    res.json(result);
  } catch (err) {
    console.error("Pronunciation assessment error:", err);
    res.status(500).json({ error: err.message });
  }
});

//TODO: Ensure we cover more audio formats, or allow ffpmeg to auto-detect
app.post(
  "/api/pronunciation-assessment-upload",
  upload.single("audio"),
  async (req, res) => {
    try {
      const { referenceText } = req.body;
      if (!req.file || !referenceText) {
        return res
          .status(400)
          .json({ error: "audio and referenceText are required." });
      }

      const inputPath = req.file.path;
      const inputMime = req.file.mimetype;
      const format = inputMime.split("/")[1];
      const wavPath = inputPath + ".wav";

      console.log("Converting from format:", format, "MIME:", inputMime);

      // Convert to WAV with proper format detection
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .audioChannels(1)
          .audioFrequency(16000)
          .toFormat("wav")
          .on("end", resolve)
          .on("error", (err) => {
            console.error("FFmpeg conversion error:", err.message);
            reject(err);
          })
          .save(wavPath);
      });

      const wavStats = fs.statSync(wavPath);
      console.log("WAV file size:", wavStats.size, "bytes");
      if (wavStats.size < 1000) {
        console.warn("WAV likely silent or failed conversion.");
      }

      const result = await assessPronunciation(wavPath, referenceText);
      const rawBest = result.NBest?.[0] || {};
      // if you ever still get an object under .PronunciationAssessment, merge it here:
      const best = rawBest.PronunciationAssessment || rawBest;

      res.json({
        overallScore: best.PronScore ?? best.AccuracyScore ?? 0,
        accuracyScore: best.AccuracyScore ?? 0,
        fluencyScore: best.FluencyScore ?? 0,
        completenessScore: best.CompletenessScore ?? 0,
        wavUrl: `/uploads/${path.basename(wavPath)}`,
      });
    } catch (err) {
      console.error("Pronunciation assessment error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// routes or main server file
app.post("/api/request-spanish-teacher", async (req, res) => {
  const { userId, walletAddress, permit } = req.body;
  if (!userId || !walletAddress || !permit || !permit.signature) {
    return res.status(400).json({ error: "Missing permit fields" });
  }

  const { owner, spender, value, nonce, deadline, signature } = permit;

  try {
    const { v, r, s } = ethers.Signature.from(signature);

    const provider = new ethers.JsonRpcProvider(SEI_RPC);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    const token = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);

    // 1) Permit
    const permitTx = await token.permit(
      owner,
      spender,
      value,
      deadline,
      v,
      r,
      s
    );
    await permitTx.wait();

    // 2) Spend
    const spendAmount = BigInt(value);
    const spendTx = await token.spendTokenFrom(owner, spendAmount);
    await spendTx.wait();

    // 3) Log session with UTC math in DB (NOT in JS)
    //    expires_at = NOW() + 20 minutes (UTC-safe)
    await db.query(
      `
  INSERT INTO teacher_sessions (user_id, tx_hash, expires_at)
  VALUES ($1, $2, NOW() + interval '20 minutes')
  ON CONFLICT (user_id) DO UPDATE
    SET tx_hash    = EXCLUDED.tx_hash,
        expires_at = NOW() + interval '20 minutes'
  `,
      [userId, spendTx.hash]
    );

    return res.json({ success: true, txHash: spendTx.hash });
  } catch (err) {
    console.error("Permit or DB error:", err);
    return res.status(500).json({ error: "Backend processing failed." });
  }
});

app.get("/api/teacher-session/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const { rows } = await db.query(
      `
      SELECT
        expires_at,
        GREATEST(EXTRACT(EPOCH FROM (expires_at - NOW())) * 1000, 0) AS remaining_ms
      FROM teacher_sessions
      WHERE user_id = $1
      ORDER BY expires_at DESC
      LIMIT 1
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.json({ hasAccess: false, remainingMs: 0 });
    }

    const expiresAt = rows[0].expires_at; // timestamptz (UTC)
    const remainingMs = Number(rows[0].remaining_ms || 0);

    return res.json({
      hasAccess: remainingMs > 0,
      remainingMs,
      expiresAt: new Date(expiresAt).toISOString(),
    });
  } catch (err) {
    console.error("Session check failed:", err);
    return res.status(500).json({ error: "Failed to check session" });
  }
});

// This endpoing exists to allow users to complete a daily quiz if they
// have not already done so today. It rewards them with 1 YAP token. If they
// have already completed the quiz today, it returns a 409 conflict error.
app.post("/api/complete-daily-quiz", async (req, res) => {
  const { userId, walletAddress } = req.body;
  if (!userId || !walletAddress) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const { rows } = await db.query(
      `SELECT id 
         FROM daily_quiz 
        WHERE user_id = $1 
          AND date = CURRENT_DATE`,
      [userId]
    );
    if (rows.length > 0) {
      return res.status(409).json({ error: "Already completed today" });
    }

    const provider = new ethers.JsonRpcProvider(SEI_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const token = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, wallet);
    const oneYap = ethers.parseUnits("1", 18);

    const tx = await token.transfer(walletAddress, oneYap);
    await tx.wait();

    const insert = await db.query(
      `INSERT INTO daily_quiz (user_id, tx_hash, reward_sent)
           VALUES ($1, $2, true)
        RETURNING id`,
      [userId, tx.hash]
    );

    console.log("Daily quiz reward logged, id:", insert.rows[0].id);
    return res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    console.error("Error completing daily quiz:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /api/daily-quiz-status/:userId
app.get("/api/daily-quiz-status/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const { rows } = await db.query(
      `SELECT 1 FROM daily_quiz WHERE user_id = $1 AND date = CURRENT_DATE`,
      [userId]
    );
    return res.json({ completed: rows.length > 0 });
  } catch (err) {
    console.error("Quiz status check error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.post("/api/elevenlabs-tts", async (req, res) => {
  try {
    const { text, voiceId = "2k1RrkiAltTGNFiT6rL1" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.byteLength,
    });

    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error("ElevenLabs TTS error:", error);
    res.status(500).json({ error: "Failed to generate audio" });
  }
});

app.post("/api/report-form", async (req, res) => {
  const { reason, explain } = req.body;

  if (!reason || !explain) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    await transporter.sendMail({
      from: `"YAP Reporter" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: `Issue Reported: ${reason}`,
      text: explain,
    });
    return res.json({ success: true });
  } catch (err) {
    console.error("Failed to send report:", err);
    return res.status(500).json({ error: "Email send failed" });
  }
});
app.use("/uploads", express.static("uploads"));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fsSync.existsSync(uploadsDir)) {
  fsSync.mkdirSync(uploadsDir, { recursive: true });
}

async function transcribeWithWhisper(filePath) {
  const fileStream = fsSync.createReadStream(filePath);
  const resp = await openai.audio.transcriptions.create({
    file: fileStream,
    model: "whisper-1",
    // language: 'es', // uncomment to force Spanish
  });
  return resp.text || "";
}
async function convertToMp3(inputPath) {
  return new Promise((resolve, reject) => {
    const outputPath = `${inputPath}.mp3`;
    ffmpeg(inputPath)
      .audioCodec("libmp3lame")
      .format("mp3")
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .save(outputPath);
  });
}

app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    // 1. Convert whatever came in to mp3
    const mp3Path = await convertToMp3(req.file.path);

    // 2. Send mp3 to Whisper
    const transcript = await transcribeWithWhisper(mp3Path);

    // 3. Cleanup temp files
    try {
      await fs.unlink(req.file.path);
    } catch {}
    try {
      await fs.unlink(mp3Path);
    } catch {}

    res.json({ text: transcript, transcript });
  } catch (err) {
    console.error("Transcription error:", err);
    res.status(500).json({
      error: "Transcription failed",
      detail: err?.message ?? String(err),
    });
  }
});
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  // Helpful logs so you can see the upgrade actually fires
  console.log("[upgrade] incoming", req.url);
  socket.on("error", (err) =>
    console.error("[upgrade] socket error:", err.message)
  );

  if (!req.url || !req.url.startsWith("/api/agent-ws")) {
    console.log("[upgrade] not our path, destroying");
    return socket.destroy();
  }

  console.log("[upgrade] handling /api/agent-ws");
  wss.handleUpgrade(req, socket, head, (ws) => {
    console.log("[upgrade] upgraded to WebSocket");
    wss.emit("connection", ws, req);
  });
});

async function getSignedUrl(agentId) {
  const url = `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(
    agentId
  )}`;
  const r = await fetch(url, { headers: { "xi-api-key": ELEVENLABS_API_KEY } });
  if (!r.ok)
    throw new Error(`Signed URL failed: ${r.status} ${await r.text()}`);
  const data = await r.json();
  if (!data?.signed_url) throw new Error("No signed_url in response");
  return data.signed_url;
}

// Helper: wrap raw PCM16 (16k mono) into WAV
function wrapPcmAsWav(
  pcmBuffers,
  sampleRate = 16000,
  numChannels = 1,
  bytesPerSample = 2
) {
  const pcmLength = pcmBuffers.reduce((a, b) => a + b.length, 0);
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmLength;
  const riffSize = 36 + dataSize;

  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(riffSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); // fmt chunk size
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(numChannels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(byteRate, 28);
  buf.writeUInt16LE(blockAlign, 32);
  buf.writeUInt16LE(bytesPerSample * 8, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);

  let off = 44;
  for (const c of pcmBuffers) {
    c.copy(buf, off);
    off += c.length;
  }
  return buf;
}

// IMPORTANT: ensure you have this in your file (once):
// const app = express();
// const server = http.createServer(app);
// server.on('upgrade', (req, socket, head) => {
//   if (req.url && req.url.startsWith('/api/agent-ws')) {
//     wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
//   } else {
//     socket.destroy();
//   }
// });

wss.on("connection", async (client) => {
  const tag = `[agent-ws:${Date.now()}]`;
  console.log(tag, "client connected");

  if (!ELEVENLABS_API_KEY || !ELEVENLABS_AGENT_ID) {
    client.send(
      JSON.stringify({ type: "error", error: "Missing ELEVENLABS env vars" })
    );
    client.close();
    return;
  }

  let elWs = null;

  // ---- "blurb" turn manager ----
  const SILENCE_MS = 900; // finalize a reply if no audio arrives for 0.9s
  const HARD_LIMIT_MS = 20000; // safety cutoff per turn
  let collecting = false;
  let turnChunks = [];
  let silenceTimer = null;
  let hardTimer = null;

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

  function finalizeTurn(reason = "unknown") {
    if (!collecting) return;
    clearTimers();
    collecting = false;
    if (turnChunks.length === 0) {
      console.log(tag, "finalizeTurn (", reason, "): no audio");
      return;
    }
    const wav = wrapPcmAsWav(turnChunks.splice(0, turnChunks.length));
    console.log(tag, `finalizeTurn (${reason}) → SEND WAV ${wav.length} bytes`);
    if (client.readyState === WebSocket.OPEN) {
      client.send(wav, { binary: true });
      // optional: notify end of turn
      client.send(JSON.stringify({ type: "turn_end" }));
    }
  }

  // ---- connect to ElevenLabs ConvAI ----
  async function connectEL() {
    const signedUrl = await getSignedUrl(ELEVENLABS_AGENT_ID);
    const ws = new WebSocket(signedUrl);
    elWs = ws;

    ws.on("open", () => {
      console.log(tag, "EL WS open");
    });

    elWs.on("message", (raw) => {
      try {
        const evt = JSON.parse(raw.toString());

        if (evt?.type === "conversation_initiation_metadata") {
          console.log(tag, "EL → type:", evt.type);
          client.send(JSON.stringify({ type: "meta", meta: evt }));
          return;
        }

        if (evt?.type === "audio") {
          // ✅ NEW: handle nested audio_event shape too
          const b64 =
            evt.audio_event?.audio_base_64 || // most ConvAI payloads
            evt.audio_base_64 || // some variants
            evt.audio; // rare fallback

          if (b64) {
            if (!collecting) startTurn();
            const buf = Buffer.from(b64, "base64");
            turnChunks.push(buf);
            console.log(tag, "EL → audio chunk bytes:", buf.length);
            bumpSilence();
          } else {
            // helpful debug if shape ever changes again
            console.log(
              tag,
              "EL → audio but no payload keys:",
              Object.keys(evt)
            );
          }
          return;
        }

        if (evt?.type === "interruption") {
          console.log(tag, "EL → interruption");
          finalizeTurn("interruption");
          return;
        }

        // ignore pings and anything else
      } catch (e) {
        // non-JSON frames; ignore safely
      }
    });

    ws.on("close", (code, reason) => {
      console.log(tag, "EL WS close", code, reason?.toString?.() || "");
      // Don’t close the browser socket. Just finalize whatever we have and wait for next user_text.
      finalizeTurn("el-close");
      elWs = null;
    });

    ws.on("error", (err) => {
      console.log(tag, "EL WS error", err?.message);
      finalizeTurn("el-error");
      // keep browser open
    });
  }

  try {
    await connectEL();
  } catch (e) {
    console.log(tag, "Failed to connect to EL:", e?.message);
    client.send(
      JSON.stringify({ type: "error", error: "Failed to reach agent" })
    );
    // keep browser socket open; they can retry sending text which will try again
  }

  // ---- browser → agent ----
  client.on("message", async (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (
        msg?.type === "user_text" &&
        typeof msg.text === "string" &&
        msg.text.trim()
      ) {
        console.log(tag, "BROWSER → user_text len:", msg.text.length);

        // If EL ws isn’t connected, attempt reconnect
        if (!elWs || elWs.readyState !== WebSocket.OPEN) {
          try {
            await connectEL();
          } catch {}
        }

        if (elWs && elWs.readyState === WebSocket.OPEN) {
          startTurn(); // start collecting a blurb for THIS message
          elWs.send(JSON.stringify({ type: "user_message", text: msg.text }));
          console.log(tag, "FORWARD → EL: user_message");
        } else {
          client.send(
            JSON.stringify({ type: "error", error: "Agent not ready" })
          );
        }
      } else if (msg?.type === "close") {
        client.close();
      }
    } catch {
      // ignore bad payloads
    }
  });

  client.on("close", () => {
    console.log(tag, "browser WS closed");
    clearTimers();
    try {
      elWs?.close();
    } catch {}
  });

  client.on("error", () => {
    clearTimers();
    try {
      elWs?.close();
    } catch {}
  });
});

// (Your existing server.listen(...) is fine)

// ---------- LISTEN ----------
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`WS bridge at ws://localhost:${PORT}/api/agent-ws`);
});
