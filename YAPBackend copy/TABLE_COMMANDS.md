CREATE TABLE users (
  user_id           TEXT        PRIMARY KEY,
  name              TEXT        NOT NULL,
  language_to_learn TEXT        NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_lessons (
  user_id      TEXT        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  lesson_id    TEXT        NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  tx_hash      TEXT,
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS user_stats (
  user_id          TEXT        PRIMARY KEY REFERENCES users(user_id),
  token_balance    NUMERIC     NOT NULL DEFAULT 0,
  current_streak   INT         NOT NULL DEFAULT 1,
  highest_streak   INT         NOT NULL DEFAULT 1,
  total_yap_earned INT         NOT NULL DEFAULT 0,
  updated_at       TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teacher_sessions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL
);
