// ai/google.js (unchanged)
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) throw new Error("Missing GOOGLE_API_KEY");

const genAI = new GoogleGenerativeAI(apiKey);

// 2.0 for scoring text, 1.5 for audio transcription
const MODEL_ID = "gemini-2.0-flash";
const TRANSCRIBE_MODEL_ID = "gemini-1.5-flash";

module.exports = { genAI, MODEL_ID, TRANSCRIBE_MODEL_ID };
