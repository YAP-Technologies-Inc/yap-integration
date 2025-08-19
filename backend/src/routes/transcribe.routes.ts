import { Router } from "express";
import { uploadDisk } from "../middleware/upload.js";
import { convertToMp3, transcribeWithWhisper } from "../services/audio.js";
import fs from "node:fs/promises";

const router = Router();

// POST /api/transcribe
router.post("/transcribe", uploadDisk.single("audio"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No audio file uploaded" });

    const mp3Path = await convertToMp3(req.file.path);
    const transcript = await transcribeWithWhisper(mp3Path);

    try {
      await fs.unlink(req.file.path);
    } catch {}
    try {
      await fs.unlink(mp3Path);
    } catch {}

    res.json({ text: transcript, transcript });
  } catch (err: any) {
    console.error("Transcription error:", err);
    res.status(500).json({
      error: "Transcription failed",
      detail: err?.message ?? String(err),
    });
  }
});

export default router;
