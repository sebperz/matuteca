import { load } from "js-yaml";
import { parseInline } from "./inline";
import type {
  Course,
  DragDropScreen,
  EndScreen,
  InlineNode,
  Lesson,
  MultipleChoiceScreen,
  Screen,
  TextScreen,
  Topic,
} from "./types";

export type { Course, Screen, Topic, Lesson, InlineNode } from "./types";

const VALID_TYPES = ["text", "multiple-choice", "drag-drop", "end"] as const;

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

interface Frontmatter {
  source_id?: string;
  title?: string;
  author?: string;
  version?: string;
}

function parseFrontmatter(yaml: string): Frontmatter {
  const parsed = load(yaml) as Record<string, string> | null;
  return {
    source_id: parsed?.source_id,
    title: parsed?.title,
    author: parsed?.author,
    version: parsed?.version,
  };
}

function validateFrontmatter(
  fm: Frontmatter,
): asserts fm is {
  source_id: string;
  title: string;
  author: string;
  version?: string;
} {
  if (!fm.source_id) {
    throw new ParseError("[line 1] source_id is required in frontmatter");
  }
  if (!fm.title) {
    throw new ParseError("[line 1] title is required in frontmatter");
  }
  if (!fm.author) {
    throw new ParseError("[line 1] author is required in frontmatter");
  }
}

interface YAMLBlock {
  yaml: string;
  startsAtLine: number;
}

function extractYAMLBlock(
  lines: string[],
  start: number,
): YAMLBlock | null {
  const yamlLines: string[] = [];
  let inBlock = false;

  for (let i = start; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    if (trimmed === "---") {
      if (!inBlock) {
        inBlock = true;
        continue;
      } else {
        return { yaml: yamlLines.join("\n"), startsAtLine: start };
      }
    }

    if (inBlock) {
      yamlLines.push(lines[i]);
    } else if (trimmed !== "") {
      return null;
    }
  }

  return null;
}

function validateActivity(
  parsed: Record<string, unknown>,
  type: string,
  lineNum: number,
): void {
  if (!parsed.question || (typeof parsed.question === "string" && !parsed.question.trim())) {
    throw new ParseError(
      `[line ${lineNum}] question is required for type ${type}`,
    );
  }
  if (!parsed.explanation || (typeof parsed.explanation === "string" && !parsed.explanation.trim())) {
    throw new ParseError(
      `[line ${lineNum}] explanation is required for type ${type}`,
    );
  }

  validateInlineMarkers(parsed.question as string, "question", lineNum);
  validateInlineMarkers(parsed.explanation as string, "explanation", lineNum);

  if (type === "multiple-choice") {
    const options = (parsed.options as string[]) ?? [];
    if (options.length < 2) {
      throw new ParseError(
        `[line ${lineNum}] options must have at least 2 items`,
      );
    }

    const correct = (parsed.correct as number[]) ?? [];
    const multiple = parsed.multiple as boolean;

    if (!multiple && correct.length !== 1) {
      throw new ParseError(
        `[line ${lineNum}] correct must have exactly 1 index when multiple is false`,
      );
    }

    for (const idx of correct) {
      if (idx < 0 || idx >= options.length) {
        throw new ParseError(
          `[line ${lineNum}] correct index ${idx} out of range (options has ${options.length} items)`,
        );
      }
    }
  }

  if (type === "drag-drop") {
    const pool = (parsed.pool as string[]) ?? [];
    if (pool.length === 0) {
      throw new ParseError(
        `[line ${lineNum}] pool must have at least 1 item`,
      );
    }

    const blanks = (parsed.blanks as { id: number; answer: string }[]) ?? [];
    const seenIds = new Set<number>();

    for (const blank of blanks) {
      if (seenIds.has(blank.id)) {
        throw new ParseError(
          `[line ${lineNum}] duplicate blank id ${blank.id}`,
        );
      }
      seenIds.add(blank.id);

      if (!pool.includes(blank.answer)) {
        throw new ParseError(
          `[line ${lineNum}] blank ${blank.id} answer "${blank.answer}" not found in pool`,
        );
      }
    }

    const text = (parsed.text as string) ?? "";
    const placeholderCount = (text.match(/\[___\]/g) ?? []).length;
    if (blanks.length !== placeholderCount) {
      throw new ParseError(
        `[line ${lineNum}] ${blanks.length} blanks defined but text has ${placeholderCount} [___] placeholders`,
      );
    }
  }
}

function validateInlineMarkers(
  text: string,
  field: string,
  lineNum: number,
): void {
  if (!text) return;

  let boldOpen = 0;
  let italicOpen = 0;
  let i = 0;

  while (i < text.length) {
    if (text[i] === "\\" && i + 1 < text.length) {
      i += 2;
      continue;
    }

    if (text[i] === "`") {
      i++;
      while (i < text.length && text[i] !== "`") i++;
      i++;
      continue;
    }

    if (text[i] === "*") {
      if (text[i + 1] === "*") {
        boldOpen = 1 - boldOpen;
        i += 2;
        continue;
      }
      if (italicOpen) {
        italicOpen = 0;
      } else {
        italicOpen = 1;
      }
      i++;
      continue;
    }

    if (text[i] === "_") {
      if (text[i + 1] === "_") {
        boldOpen = 1 - boldOpen;
        i += 2;
        continue;
      }
      if (italicOpen) {
        italicOpen = 0;
      } else {
        italicOpen = 1;
      }
      i++;
      continue;
    }

    i++;
  }

  if (boldOpen) {
    throw new ParseError(
      `[line ${lineNum}] unmatched bold marker "**" in ${field}`,
    );
  }

  if (italicOpen) {
    throw new ParseError(
      `[line ${lineNum}] unmatched italic marker "*" in ${field}`,
    );
  }
}

function parseScreenBody(
  bodyLines: string[],
  startLine: number,
  headingLine: string,
): Screen {
  const title = headingLine.replace(/^### Pantalla:\s*/, "").trim();
  const body = bodyLines.join("\n").trim();

  const yamlBlock = extractYAMLBlock(bodyLines, 0);

  if (yamlBlock) {
    const parsed = load(yamlBlock.yaml) as Record<string, unknown> | null;
    if (!parsed || typeof parsed !== "object") {
      return { type: "text", title, nodes: [] };
    }

    const type = parsed.type as string;
    if (!type || !VALID_TYPES.includes(type as never)) {
      const lineNum = startLine + yamlBlock.startsAtLine + 1;
      throw new ParseError(
        `[line ${lineNum}] unknown screen type "${type}". Valid types: text, multiple-choice, drag-drop, end`,
      );
    }

    if (type === "end") {
      return { type: "end", title } as EndScreen;
    }

    const lineNum = startLine + yamlBlock.startsAtLine + 1;
    validateActivity(parsed, type, lineNum);

    if (type === "multiple-choice") {
      return {
        type: "multiple-choice",
        title,
        multiple: parsed.multiple ?? false,
        question: parsed.question as string,
        options: parsed.options as string[],
        correct: parsed.correct as number[],
        explanation: parsed.explanation as string,
      } as MultipleChoiceScreen;
    }

    if (type === "drag-drop") {
      return {
        type: "drag-drop",
        title,
        reusable: parsed.reusable ?? false,
        text: parsed.text as string,
        pool: parsed.pool as string[],
        blanks: parsed.blanks as { id: number; answer: string }[],
        explanation: parsed.explanation as string,
      } as DragDropScreen;
    }
  }

  if (!body) {
    if (yamlBlock) return { type: "text", title, nodes: [] };
    throw new ParseError(
      `[line ${startLine + 1}] text screen "${title}" has no content`,
    );
  }

  return {
    type: "text",
    title,
    nodes: parseInline(body),
  } as TextScreen;
}

interface HeadingMatch {
  level: number;
  title: string;
  lineIndex: number;
}

function findHeadings(lines: string[]): HeadingMatch[] {
  const headings: HeadingMatch[] = [];
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,3})\s+(Pantalla|Lección|Tema):\s*(.+)/);
    if (match) {
      headings.push({
        level: match[1].length,
        title: match[3].trim(),
        lineIndex: i,
      });
    }
  }
  return headings;
}

export function parseMarkdown(content: string): Course {
  const normalized = content.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  const frontmatterEnd = lines.indexOf("---", 1);
  const frontmatterYaml = lines.slice(1, frontmatterEnd).join("\n");
  const fm = parseFrontmatter(frontmatterYaml);
  validateFrontmatter(fm);

  const bodyLines = lines.slice(frontmatterEnd + 1);
  const headings = findHeadings(bodyLines);

  const course: Course = {
    source_id: fm.source_id,
    title: fm.title,
    author: fm.author,
    version: fm.version ?? "1.0.0",
    topics: [],
  };

  let currentTopic: Topic | null = null;
  let currentLesson: Lesson | null = null;
  let currentScreenStartLine = -1;
  let currentScreenHeading = "";

  function flushScreen(lineEnd: number) {
    if (!currentLesson || currentScreenStartLine < 0) return;
    const screenBodyLines = bodyLines.slice(
      currentScreenStartLine,
      lineEnd,
    );
    const lineOffset = frontmatterEnd + 1 + currentScreenStartLine;
    const screen = parseScreenBody(
      screenBodyLines,
      lineOffset,
      currentScreenHeading,
    );
    currentLesson.screens.push(screen);
    currentScreenStartLine = -1;
    currentScreenHeading = "";
  }

  for (let i = 0; i < headings.length; i++) {
    const h = headings[i];

    if (h.level === 1) {
      flushScreen(h.lineIndex);
      currentScreenStartLine = -1;
      currentLesson = null;
      currentTopic = { title: h.title, lessons: [] };
      course.topics.push(currentTopic);
    } else if (h.level === 2) {
      flushScreen(h.lineIndex);
      currentScreenStartLine = -1;
      if (!currentTopic) {
        const absoluteLine = frontmatterEnd + 1 + h.lineIndex + 1;
        throw new ParseError(
          `[line ${absoluteLine}] lesson "${h.title}" has no parent topic`,
        );
      }
      currentLesson = { title: h.title, screens: [] };
      currentTopic.lessons.push(currentLesson);
    } else if (h.level === 3) {
      flushScreen(h.lineIndex);
      if (!currentLesson) {
        const absoluteLine = frontmatterEnd + 1 + h.lineIndex + 1;
        throw new ParseError(
          `[line ${absoluteLine}] screen "${h.title}" has no parent lesson`,
        );
      }
      currentScreenStartLine = h.lineIndex + 1;
      currentScreenHeading = bodyLines[h.lineIndex];
    }
  }

  flushScreen(bodyLines.length);

  return course;
}
