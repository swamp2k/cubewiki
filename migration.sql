-- Run with:
-- npx wrangler d1 execute cc-compendium-db --remote --file=migration.sql

CREATE TABLE IF NOT EXISTS user_recipes (
  name        TEXT PRIMARY KEY,
  input1      TEXT NOT NULL,
  input2      TEXT NOT NULL,
  category    TEXT NOT NULL,
  obtain      TEXT,
  updated_at  INTEGER DEFAULT (unixepoch())
);
