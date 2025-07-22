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