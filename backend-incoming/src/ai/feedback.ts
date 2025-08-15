import { genAI, MODEL_ID } from "./google.js";

/* ================= Types ================= */

export interface PronunciationFeedbackText {
  isCorrect: boolean;
  accuracyScore: number;   // 0–100
  fluencyScore: number;    // 0–100
  intonationScore: number; // 0–100
  overallScore: number;    // 0–100
  confidence: number;      // 0–1
  accuracy: string;
  fluency: string;
  intonation: string;
  overall: string;
}

export interface AudioPronunciationFeedback {
  overallScore?: number;
  accuracyScore?: number;
  fluencyScore?: number;
  intonationScore?: number;
  confidence?: number;
  transcribedText?: string;
  accuracy?: string;
  fluency?: string;
  intonation?: string;
  overall?: string;
  specificIssues?: string[];
}

type GetPronunciationTextArgs = {
  spokenText: string;
  targetPhrase: string;
};

type GetPronunciationAudioArgs = {
  audio: Buffer | string;   // raw Buffer or base64 string
  targetPhrase: string;
  mime?: string;
};

/* ============ Helpers ============ */

function stripCodeFences(s = ""): string {
  return s.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
}

function pickFormatFromMime(mime = ""): "webm" | "ogg" | "m4a" | "wav" | "mp3" | "wav" {
  const m = mime.toLowerCase();
  if (m.includes("webm")) return "webm";
  if (m.includes("ogg")) return "ogg";
  if (m.includes("mp4") || m.includes("m4a")) return "m4a";
  if (m.includes("wav")) return "wav";
  if (m.includes("mpeg") || m.includes("mp3")) return "mp3";
  return "wav";
}

/**
 * Dynamically import your Genkit flow. Works in dev (tsx) and in dist.
 * Tries `.js` first (built output), then `.ts` (dev).
 */
async function loadGenkitFlow(): Promise<{ getAudioPronunciationFeedback: (args: any) => Promise<AudioPronunciationFeedback> }> {
  let lastErr: unknown;
  const candidates = [
    new URL("./flows/audio-pronunciation-feedback.js", import.meta.url).href,
    new URL("./flows/audio-pronunciation-feedback.ts", import.meta.url).href
  ];

  for (const href of candidates) {
    try {
      const mod = await import(href);
      if (mod?.getAudioPronunciationFeedback) return mod;
    } catch (err) {
      lastErr = err;
    }
  }
  throw (lastErr ?? new Error("Could not load audio-pronunciation Genkit flow"));
}

/* ============ Text-based scoring (unchanged behavior) ============ */

export async function getPronunciationFeedback({
  spokenText,
  targetPhrase
}: GetPronunciationTextArgs): Promise<PronunciationFeedbackText> {
  const prompt = `
You are an expert Spanish pronunciation coach. A user is trying to pronounce the phrase "${targetPhrase}" and they said "${spokenText}".

Provide comprehensive feedback including numerical scores (0-100) and detailed text analysis. Be encouraging and constructive.

SCORING GUIDELINES:
- 90-100: Excellent/Perfect pronunciation
- 80-89: Very good with minor issues
- 70-79: Good with some noticeable issues
- 60-69: Fair with several issues
- 50-59: Poor but understandable
- 0-49: Very poor or unintelligible

ASSESSMENT STEPS:
1. First, decide if the pronunciation was good enough to be considered 'correct' (set isCorrect boolean). A perfect match isn't necessary, but it should be clearly understandable.

2. Rate each category on a 0-100 scale:
   - accuracyScore: How well individual sounds and words were pronounced
   - fluencyScore: How natural the rhythm and flow was
   - intonationScore: How appropriate the pitch and tone were
   - overallScore: Combined assessment of all factors

3. Set confidence level (0-1) based on how certain you are of the assessment.

4. Provide detailed text feedback for each category (accuracy, fluency, intonation, overall).

5. For the overall summary, start with "¡Perfecto!" (90+), "¡Muy bien!" (80-89), "¡Buen trabajo!" (70-79), or "¡Sigue practicando!" (below 70).

Return ONLY JSON with keys:
isCorrect (boolean),
accuracyScore (0-100),
fluencyScore (0-100),
intonationScore (0-100),
overallScore (0-100),
confidence (0-1),
accuracy (string),
fluency (string),
intonation (string),
overall (string).
`.trim();

  const model = genAI.getGenerativeModel({
    model: MODEL_ID!,
    generationConfig: { responseMimeType: "application/json" }
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  });

  const raw = result?.response?.text?.() ?? "";
  const text = stripCodeFences(raw);

  try {
    return JSON.parse(text) as PronunciationFeedbackText;
  } catch {
    const fallback: PronunciationFeedbackText = {
      isCorrect: false,
      accuracyScore: 0,
      fluencyScore: 0,
      intonationScore: 0,
      overallScore: 0,
      confidence: 0,
      accuracy: "I couldn't parse the assessment. Please try again.",
      fluency: "I couldn't parse the assessment. Please try again.",
      intonation: "I couldn't parse the assessment. Please try again.",
      overall: "Please try again."
    };
    return fallback;
  }
}

/* ============ Audio-first scoring via your Genkit flow ============ */

export async function getPronunciationFeedbackFromAudio({
  audio,
  targetPhrase,
  mime
}: GetPronunciationAudioArgs): Promise<AudioPronunciationFeedback> {
  const { getAudioPronunciationFeedback } = await loadGenkitFlow();

  const audioData =
    Buffer.isBuffer(audio) ? (audio as Buffer).toString("base64") : String(audio);

  const audioFormat = pickFormatFromMime(mime);

  const out = await getAudioPronunciationFeedback({
    audioData,
    targetPhrase,
    audioFormat
  });

  return out as AudioPronunciationFeedback;
}
