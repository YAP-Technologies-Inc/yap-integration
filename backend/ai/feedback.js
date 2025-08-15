// ai/feedback.js
const path = require("path");
const { genAI, MODEL_ID } = require("./google");

// ---------------- existing text-based scoring (unchanged) ----------------
function stripCodeFences(s = "") {
  return s.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
}

async function getPronunciationFeedback({ spokenText, targetPhrase }) {
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
    model: MODEL_ID,
    generationConfig: { responseMimeType: "application/json" },
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const text = stripCodeFences(result.response.text() || "");
  try {
    return JSON.parse(text);
  } catch {
    return {
      isCorrect: false,
      accuracyScore: 0,
      fluencyScore: 0,
      intonationScore: 0,
      overallScore: 0,
      confidence: 0,
      accuracy: "I couldn't parse the assessment. Please try again.",
      fluency: "I couldn't parse the assessment. Please try again.",
      intonation: "I couldn't parse the assessment. Please try again.",
      overall: "Please try again.",
    };
  }
}

// ---------------- new: audio-first scoring via your Genkit flow ----------------
function pickFormatFromMime(mime = "") {
  mime = String(mime).toLowerCase();
  if (mime.includes("webm")) return "webm";
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("mp4") || mime.includes("m4a")) return "m4a";
  if (mime.includes("wav")) return "wav";
  if (mime.includes("mpeg") || mime.includes("mp3")) return "mp3";
  return "wav";
}

// We dynamically import your flow to avoid ESM/CJS headaches.
async function loadGenkitFlow() {
  const tryPaths = [
    path.join(process.cwd(), "ai/flows/audio-pronunciation-feedback.js"),
    path.join(process.cwd(), "ai/flows/audio-pronunciation-feedback.ts"),
  ];
  let lastErr;
  for (const p of tryPaths) {
    try {
      return await import(p);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error("Could not load audio-pronunciation Genkit flow");
}

/**
 * Audio-first feedback using your Genkit flow.
 * @param {Object} params
 * @param {Buffer|string} params.audio - raw Buffer or base64
 * @param {string} params.targetPhrase
 * @param {string} [params.mime]
 */
async function getPronunciationFeedbackFromAudio({ audio, targetPhrase, mime }) {
  const { getAudioPronunciationFeedback } = await loadGenkitFlow();

  const audioData = Buffer.isBuffer(audio) ? audio.toString("base64") : String(audio);
  const audioFormat = pickFormatFromMime(mime);

  // This returns the rich object your flow defines (with transcribedText, specificIssues, etc.)
  const out = await getAudioPronunciationFeedback({
    audioData,
    targetPhrase,
    audioFormat,
  });

  return out;
}

module.exports = {
  getPronunciationFeedback,
  getPronunciationFeedbackFromAudio, // <-- new export
};
