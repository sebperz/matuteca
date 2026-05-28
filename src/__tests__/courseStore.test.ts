import { useCourseStore } from "../stores/courseStore";

describe("useCourseStore", () => {
  beforeEach(() => {
    useCourseStore.setState({ courses: [], isLoading: false });
  });

  it("returns empty courses array by default", () => {
    const state = useCourseStore.getState();
    expect(state.courses).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it("addCourse prepends and deduplicates by source_id", () => {
    const course = {
      source_id: "test-1",
      title: "Test",
      author: "Author",
      version: "1.0.0",
      topics: [],
    };

    useCourseStore.getState().addCourse(course);
    expect(useCourseStore.getState().courses).toHaveLength(1);

    useCourseStore.getState().addCourse(course);
    expect(useCourseStore.getState().courses).toHaveLength(1);
  });

  it("removeCourse removes by source_id", () => {
    useCourseStore.getState().addCourse({
      source_id: "test-1",
      title: "Test",
      author: "Author",
      version: "1.0.0",
      topics: [],
    });

    useCourseStore.getState().removeCourse("test-1");
    expect(useCourseStore.getState().courses).toHaveLength(0);
  });

  it("setCourses hydrates the store", () => {
    useCourseStore.getState().setCourses([
      {
        source_id: "a",
        title: "A",
        author: "Author",
        version: "1.0.0",
        topics: [],
      },
      {
        source_id: "b",
        title: "B",
        author: "Author",
        version: "1.0.0",
        topics: [],
      },
    ]);

    expect(useCourseStore.getState().courses).toHaveLength(2);
    expect(useCourseStore.getState().isLoading).toBe(false);
  });
});
