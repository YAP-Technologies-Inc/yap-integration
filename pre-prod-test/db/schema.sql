CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  language_to_learn TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_lessons (
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  tx_hash TEXT,
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS user_stats (
  user_id TEXT PRIMARY KEY REFERENCES users(user_id),
  token_balance NUMERIC NOT NULL DEFAULT 0,
  current_streak INT NOT NULL DEFAULT 1,
  highest_streak INT NOT NULL DEFAULT 1,
  total_yap_earned INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teacher_sessions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  tx_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

-- make sure expires_at is timestamptz if re-running
ALTER TABLE teacher_sessions
  ALTER COLUMN expires_at TYPE timestamptz;

CREATE INDEX IF NOT EXISTS idx_teacher_sessions_expires_at
  ON teacher_sessions (expires_at);

CREATE TABLE IF NOT EXISTS daily_quiz (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  tx_hash TEXT,
  reward_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- helpful uniqueness to avoid dup daily rewards if you want it locally too:
CREATE UNIQUE INDEX IF NOT EXISTS uq_daily_quiz_user_date
  ON daily_quiz(user_id, date);
