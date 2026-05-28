import { getDatabase } from "./database";

interface CourseRow {
  source_id: string;
  title: string;
  author: string;
  version: string;
  content: string;
  installed_at: string;
}

interface InsertCourseParams {
  source_id: string;
  title: string;
  author: string;
  version: string;
  content: string;
}

export async function insertCourse(params: InsertCourseParams): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `INSERT INTO courses (source_id, title, author, version, content, installed_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      params.source_id,
      params.title,
      params.author,
      params.version,
      params.content,
      new Date().toISOString(),
    ],
  );
}

export async function getAllCourses(): Promise<CourseRow[]> {
  const db = getDatabase();
  return db.getAllAsync(
    "SELECT * FROM courses ORDER BY installed_at DESC",
  ) as Promise<CourseRow[]>;
}

export async function courseExists(sourceId: string): Promise<boolean> {
  const db = getDatabase();
  const row = await db.getFirstAsync(
    "SELECT 1 FROM courses WHERE source_id = ?",
    [sourceId],
  );
  return row !== null;
}

export async function replaceCourse(
  sourceId: string,
  params: InsertCourseParams,
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `UPDATE courses SET title = ?, author = ?, version = ?, content = ?, installed_at = ?
     WHERE source_id = ?`,
    [
      params.title,
      params.author,
      params.version,
      params.content,
      new Date().toISOString(),
      sourceId,
    ],
  );
}

export async function deleteCourse(sourceId: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync("DELETE FROM courses WHERE source_id = ?", [sourceId]);
}
