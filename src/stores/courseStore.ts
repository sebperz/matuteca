import { create } from "zustand";
import type { Course } from "../parser/types";

interface CourseState {
  courses: Course[];
  isLoading: boolean;
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  removeCourse: (sourceId: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  isLoading: false,
  setCourses: (courses) => set({ courses, isLoading: false }),
  addCourse: (course) =>
    set((state) => ({
      courses: [
        course,
        ...state.courses.filter((c) => c.source_id !== course.source_id),
      ],
    })),
  removeCourse: (sourceId) =>
    set((state) => ({
      courses: state.courses.filter((c) => c.source_id !== sourceId),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));
