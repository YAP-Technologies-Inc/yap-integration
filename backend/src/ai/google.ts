import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) throw new Error("Missing GOOGLE_API_KEY");

export const genAI = new GoogleGenerativeAI(apiKey);

export const MODEL_ID = process.env.MODEL_ID;
export const TRANSCRIBE_MODEL_ID = process.env.TRANSCRIBE_MODEL_ID;
