import { Router } from "express";
import { uploadMemory } from "../middleware/upload.js";
import { cleanMime } from "../services/audio.js";
import { genAI } from "../ai/google.js";
import {
  getPronunciationFeedback,
  getPronunciationFeedbackFromAudio
} from "../ai/feedback.js";

const router = Router();

// gemini models for STT fallback
const GEM_MODELS = process.env.GEM_MODELS?.split(",").map(m => m.trim());

async function transcribeWithGemini(buffer: Buffer, mime: string) {
  const b64 = buffer.toString("base64");
  let lastErr: any;
  for (const modelId of GEM_MODELS!) {
    try {
      const model = genAI.getGenerativeModel({ model: modelId, generationConfig: { temperature: 0 } });
      const resp = await model.generateContent({
        contents: [{
          role: "user",
          parts: [
            { text: "Transcribe the following Spanish audio. Return ONLY the transcript text (no quotes, no extra words)." },
            { inlineData: { data: b64, mimeType: mime } }
          ]
        }]
      });
      const text = (resp?.response?.text?.() || "").trim();
      if (text) return text;
    } catch (err: any) {
      lastErr = err;
      if (err?.status !== 503) break;
    }
  }
  if (lastErr) throw lastErr;
  return "";
}

// POST /api/pronunciation
router.post("/pronunciation", uploadMemory.single("audio"), async (req, res) => {
  try {
    let { targetPhrase = "", transcript = "", spokenText = "" } = (req.body || {}) as any;
    targetPhrase = String(targetPhrase || "").trim();
    spokenText = String(spokenText || transcript || "").trim();

    if (req.file) req.file.mimetype = cleanMime(req.file.mimetype);

    let finalTranscript = spokenText;

    if (!finalTranscript && req.file?.buffer?.length) {
      try {
        finalTranscript = await transcribeWithGemini(req.file.buffer, req.file.mimetype || "audio/webm");
      } catch (err: any) {
        if (err?.status === 503) return res.status(503).json({ error: "Speech engine busy. Try again." });
        console.error("[/api/pronunciation] transcribe error:", err);
      }
    }

    let feedback: any = null;

    if (req.file?.buffer?.length) {
      try {
        feedback = await getPronunciationFeedbackFromAudio({
          audio: req.file.buffer,
          targetPhrase,
          mime: req.file.mimetype || "audio/webm"
        });
      } catch (e: any) {
        console.warn("[/api/pronunciation] audio flow failed, falling back to text:", e?.message);
      }
    }

    if (!feedback) {
      if (!finalTranscript) {
        return res.status(422).json({
          error: "No spoken text found (empty/inaudible recording?)",
          debug: {
            hasFile: !!req.file,
            fileSize: req.file?.size || 0,
            fileMime: req.file?.mimetype || null,
            targetPhrase,
            bodyKeys: Object.keys(req.body || {})
          }
        });
      }
      feedback = await getPronunciationFeedback({ spokenText: finalTranscript, targetPhrase });
    }

    const payload = {
      overallScore: feedback.overallScore ?? 0,
      accuracyScore: feedback.accuracyScore ?? 0,
      fluencyScore: feedback.fluencyScore ?? 0,
      intonationScore: feedback.intonationScore ?? 0,
      confidence: feedback.confidence ?? 0,
      transcript: feedback.transcribedText || finalTranscript || "",
      accuracyText: feedback.accuracy || "",
      fluencyText: feedback.fluency || "",
      intonationText: feedback.intonation || "",
      overallText: feedback.overall || "",
      specificIssues: feedback.specificIssues || []
    };

    return res.json(payload);
  } catch (err: any) {
    console.error("[/api/pronunciation] fatal:", err);
    return res.status(500).json({ error: err?.message || "Internal error" });
  }
});

export default router;
