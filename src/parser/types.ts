export interface InlineNode {
  type: "text" | "bold" | "italic" | "code";
  text?: string;
  content?: InlineNode[];
}

export interface TextScreen {
  type: "text";
  title: string;
  nodes: InlineNode[];
}

export interface MultipleChoiceScreen {
  type: "multiple-choice";
  title: string;
  multiple: boolean;
  question: string;
  options: string[];
  correct: number[];
  explanation: string;
}

export interface DragDropScreen {
  type: "drag-drop";
  title: string;
  reusable: boolean;
  text: string;
  pool: string[];
  blanks: { id: number; answer: string }[];
  explanation: string;
}

export interface EndScreen {
  type: "end";
  title: string;
}

export type Screen =
  | TextScreen
  | MultipleChoiceScreen
  | DragDropScreen
  | EndScreen;

export interface Lesson {
  title: string;
  screens: Screen[];
}

export interface Topic {
  title: string;
  lessons: Lesson[];
}

export interface Course {
  source_id: string;
  title: string;
  author: string;
  version: string;
  topics: Topic[];
}
