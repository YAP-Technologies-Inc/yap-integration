import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import fs from "node:fs";
import fsSync from "node:fs";
import OpenAI from "openai";

import { OPENAI_API_KEY } from "../config/env.js";
ffmpeg.setFfmpegPath((ffmpegStatic as unknown as { path: string }).path);

export function convertToMp3(inputPath: string): Promise<string> {
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

export async function transcribeWithWhisper(filePath: string): Promise<string> {
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  const fileStream = fsSync.createReadStream(filePath);
  const resp = await openai.audio.transcriptions.create({
    file: fileStream as any,
    model: "whisper-1",
  } as any);
  return (resp as any).text || "";
}

// utility for wav wrapping used by WS bridge
export function wrapPcmAsWav(
  pcmBuffers: Buffer[],
  sampleRate = 16000,
  numChannels = 1,
  bytesPerSample = 2,
): Buffer {
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
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
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

// for Gemini MIME normalization
export const cleanMime = (m?: string) =>
  String(m || "audio/webm").split(";")[0];
