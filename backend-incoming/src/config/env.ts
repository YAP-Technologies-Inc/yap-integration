import "dotenv/config";

// keep side-effects (loads .env). You can export typed helpers if you want:
export const {
  PGUSER,
  PGHOST,
  PGDATABASE,
  PGPASSWORD,
  PGPORT,
  PRIVATE_KEY,
  TOKEN_ADDRESS,
  TREASURY_ADDRESS,
  ELEVENLABS_AGENT_ID,
  ELEVENLABS_API_KEY,
  OPENAI_API_KEY,
  FLOWGLAD_SECRET_KEY,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_TO,
  SEI_RPC
} = process.env;
