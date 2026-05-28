import { getDatabase } from "./database";

interface ActivityRow {
  date: string;
  lessons_completed: number;
}

export async function getDailyActivity(): Promise<ActivityRow[]> {
  const db = getDatabase();
  return db.getAllAsync<ActivityRow>(
    "SELECT * FROM daily_activity ORDER BY date DESC",
  );
}

export async function recordDailyActivity(): Promise<void> {
  const db = getDatabase();
  const today = new Date().toISOString().split("T")[0];
  await db.runAsync(
    `INSERT INTO daily_activity (date, lessons_completed)
     VALUES (?, 1)
     ON CONFLICT(date)
     DO UPDATE SET lessons_completed = lessons_completed + 1`,
    [today],
  );
}

interface ProgressRow {
  source_id: string;
  topic_index: number;
  lesson_index: number;
  screen_index: number;
  completed: number;
}

export async function getRecentProgress(): Promise<ProgressRow | null> {
  const db = getDatabase();
  return db.getFirstAsync<ProgressRow>(
    "SELECT * FROM lesson_progress ORDER BY source_id DESC LIMIT 1",
  );
}

export async function getWeeklyLessonCount(): Promise<number> {
  const db = getDatabase();
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  const mondayStr = monday.toISOString().split("T")[0];

  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM lesson_progress WHERE completed = 1",
  );

  return row?.count ?? 0;
}
