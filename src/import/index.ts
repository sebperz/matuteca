import { parseMarkdown, Course } from "../parser";
import { insertCourse, courseExists, replaceCourse } from "../db/courses";

export async function importCourse(content: string): Promise<Course> {
  const course = parseMarkdown(content);

  await insertCourse({
    source_id: course.source_id,
    title: course.title,
    author: course.author,
    version: course.version,
    content: JSON.stringify(course),
  });

  return course;
}

export interface ImportOrReplaceResult {
  course: Course;
  replaced: boolean;
}

export async function importOrReplaceCourse(
  content: string,
): Promise<ImportOrReplaceResult> {
  const course = parseMarkdown(content);
  const exists = await courseExists(course.source_id);

  if (exists) {
    await replaceCourse(course.source_id, {
      source_id: course.source_id,
      title: course.title,
      author: course.author,
      version: course.version,
      content: JSON.stringify(course),
    });
    return { course, replaced: true };
  }

  await insertCourse({
    source_id: course.source_id,
    title: course.title,
    author: course.author,
    version: course.version,
    content: JSON.stringify(course),
  });

  return { course, replaced: false };
}
