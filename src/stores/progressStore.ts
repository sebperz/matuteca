import { create } from "zustand";

export interface LessonProgress {
  source_id: string;
  topic_index: number;
  lesson_index: number;
  screen_index: number;
  completed: boolean;
}

interface ProgressState {
  progress: Record<string, LessonProgress>;
  isLoading: boolean;
}

export const useProgressStore = create<ProgressState>(() => ({
  progress: {},
  isLoading: false,
}));
