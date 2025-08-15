import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";

import tokenRouter from "./routes/token.routes.js";
import lessonsRouter from "./routes/lessons.routes.js";
import statsRouter from "./routes/stats.routes.js";
import authRouter from "./routes/auth.routes.js";
import profileRouter from "./routes/profile.routes.js";
import pronunciationRouter from "./routes/pronunciation.routes.js";
import transcribeRouter from "./routes/transcribe.routes.js";
import teacherRouter from "./routes/teacher.routes.js";
import dailyQuizRouter from "./routes/dailyQuiz.routes.js";
import ttsRouter from "./routes/tts.routes.js";
import reportRouter from "../src/routes/report.routes.js"

const app = express();
app.use(cors());
app.use(express.json());

// static uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static("uploads"));

// mount routes (no security middleware yet)
app.use("/api", tokenRouter);
app.use("/api", lessonsRouter);
app.use("/api", statsRouter);
app.use("/api", authRouter);
app.use("/api", profileRouter);
app.use("/api", pronunciationRouter);
app.use("/api", transcribeRouter);
app.use("/api", teacherRouter);
app.use("/api", dailyQuizRouter);
app.use("/api", ttsRouter);
app.use("/api", reportRouter);

export default app;
