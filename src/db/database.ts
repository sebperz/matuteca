import { openDatabaseSync } from "expo-sqlite";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS courses (
  source_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  version TEXT NOT NULL,
  content TEXT,
  installed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  source_id TEXT NOT NULL,
  topic_index INTEGER NOT NULL,
  lesson_index INTEGER NOT NULL,
  screen_index INTEGER NOT NULL DEFAULT 0,
  completed INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (source_id, topic_index, lesson_index)
);

CREATE TABLE IF NOT EXISTS daily_activity (
  date TEXT PRIMARY KEY,
  lessons_completed INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS freezes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  earned_at TEXT NOT NULL,
  used_at TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

let db: ReturnType<typeof openDatabaseSync> | null = null;

export function getDatabase() {
  if (!db) {
    db = openDatabaseSync("movilapp.db");
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = getDatabase();
  await database.execAsync(SCHEMA);
}
