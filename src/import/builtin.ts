import { ParseError } from "../parser";
import { importOrReplaceCourse } from "./index";

interface BuiltInFile {
  filename: string;
  content: string;
}

interface BuiltInResult {
  imported: string[];
  errors: { filename: string; message: string }[];
}

export async function loadBuiltInCourses(
  files: BuiltInFile[],
): Promise<BuiltInResult> {
  const imported: string[] = [];
  const errors: { filename: string; message: string }[] = [];

  for (const file of files) {
    try {
      const result = await importOrReplaceCourse(file.content);
      imported.push(result.course.source_id);
    } catch (err) {
      const message =
        err instanceof ParseError || err instanceof Error
          ? err.message
          : String(err);
      errors.push({ filename: file.filename, message });
    }
  }

  return { imported, errors };
}
