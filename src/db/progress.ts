import { getDatabase } from "./database";

interface LessonProgressRow {
  source_id: string;
  topic_index: number;
  lesson_index: number;
  screen_index: number;
  completed: number;
}

export async function saveScreenProgress(
  sourceId: string,
  topicIndex: number,
  lessonIndex: number,
  screenIndex: number,
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `INSERT INTO lesson_progress (source_id, topic_index, lesson_index, screen_index, completed)
     VALUES (?, ?, ?, ?, 0)
     ON CONFLICT(source_id, topic_index, lesson_index)
     DO UPDATE SET screen_index = ?`,
    [sourceId, topicIndex, lessonIndex, screenIndex, screenIndex],
  );
}

export async function getLessonProgress(
  sourceId: string,
  topicIndex: number,
  lessonIndex: number,
): Promise<{
  screen_index: number;
  completed: boolean;
} | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<LessonProgressRow>(
    "SELECT * FROM lesson_progress WHERE source_id = ? AND topic_index = ? AND lesson_index = ?",
    [sourceId, topicIndex, lessonIndex],
  );

  if (!row) return null;

  return {
    screen_index: row.screen_index,
    completed: row.completed === 1,
  };
}

export async function markLessonCompleted(
  sourceId: string,
  topicIndex: number,
  lessonIndex: number,
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `UPDATE lesson_progress SET completed = 1
     WHERE source_id = ? AND topic_index = ? AND lesson_index = ?`,
    [sourceId, topicIndex, lessonIndex],
  );
}
