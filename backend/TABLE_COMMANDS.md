CREATE TABLE users (
user_id TEXT PRIMARY KEY,
name TEXT NOT NULL,
language_to_learn TEXT NOT NULL,
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_lessons (
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

CREATE TABLE teacher_sessions (
id SERIAL PRIMARY KEY,
user_id TEXT NOT NULL UNIQUE,
tx_hash TEXT NOT NULL,
expires_at TIMESTAMP NOT NULL
);

ALTER TABLE teacher_sessions
ALTER COLUMN expires_at TYPE timestamptz
USING (CASE
WHEN pg_typeof(expires_at)::text = 'timestamp without time zone'
THEN expires_at AT TIME ZONE 'UTC'
ELSE expires_at
END);

CREATE INDEX IF NOT EXISTS idx_teacher_sessions_expires_at
ON teacher_sessions (expires_at);

CREATE TABLE daily_quiz (
id SERIAL PRIMARY KEY,
user_id TEXT NOT NULL,
date DATE NOT NULL DEFAULT CURRENT_DATE,
tx_hash TEXT,
reward_sent BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- LESSON RUNS (per attempt)
CREATE TABLE IF NOT EXISTS lesson_runs (
  id              BIGSERIAL PRIMARY KEY,
  user_id         TEXT NOT NULL,                 -- did:privy:...
  lesson_id       TEXT NOT NULL,                 -- SPA1_001
  attempt_id      UUID NOT NULL,
  score_overall   INT  NOT NULL,
  score_accuracy  INT  NOT NULL,
  score_fluency   INT  NOT NULL,
  score_intonation INT NOT NULL,
  phrases         JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{prompt:"hola", userSaid:"ola"}...]
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_runs_user_lesson ON lesson_runs (user_id, lesson_id, created_at DESC);

-- QUIZ RUNS (one row per take of the “Final Quiz” for that 1–5 group)
CREATE TABLE IF NOT EXISTS quiz_runs (
  id              BIGSERIAL PRIMARY KEY,
  user_id         TEXT NOT NULL,
  group_slug      TEXT NOT NULL,                 -- e.g. lessons_1-5_first_contact
  attempt_id      UUID NOT NULL,
  score_overall   INT  NOT NULL,
  score_accuracy  INT  NOT NULL,
  score_fluency   INT  NOT NULL,
  score_intonation INT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_runs_user_group ON quiz_runs (user_id, group_slug, created_at DESC);
-- avoid duplicate rows if the client retries
ALTER TABLE lesson_runs
  ADD CONSTRAINT uq_lesson_run UNIQUE (user_id, lesson_id, attempt_id);

ALTER TABLE quiz_runs
  ADD CONSTRAINT uq_quiz_run UNIQUE (user_id, group_slug, attempt_id);
