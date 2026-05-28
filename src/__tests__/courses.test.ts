import { initDatabase } from "../db/database";
import { insertCourse, getAllCourses, courseExists, replaceCourse, deleteCourse } from "../db/courses";

jest.mock("expo-sqlite", () => {
  const mockDb = {
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1 }),
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
  };
  return {
    openDatabaseSync: jest.fn(() => mockDb),
  };
});

describe("course database operations", () => {
  beforeEach(async () => {
    await initDatabase();
    jest.clearAllMocks();
  });

  it("inserts a course and retrieves it via getAllCourses", async () => {
    const { openDatabaseSync } = require("expo-sqlite");
    const mockDb = openDatabaseSync();

    mockDb.getAllAsync.mockResolvedValue([
      {
        source_id: "test-1",
        title: "Test Course",
        author: "Test Author",
        version: "1.0.0",
        content: '{"topics":[]}',
        installed_at: "2024-01-01T00:00:00.000Z",
      },
    ]);

    await insertCourse({
      source_id: "test-1",
      title: "Test Course",
      author: "Test Author",
      version: "1.0.0",
      content: '{"topics":[]}',
    });

    const courses = await getAllCourses();

    expect(courses).toHaveLength(1);
    expect(courses[0].source_id).toBe("test-1");
    expect(courses[0].title).toBe("Test Course");
    expect(courses[0].author).toBe("Test Author");
    expect(courses[0].version).toBe("1.0.0");
    expect(courses[0].installed_at).toBe("2024-01-01T00:00:00.000Z");
  });

  it("detects existing course by source_id", async () => {
    const { openDatabaseSync } = require("expo-sqlite");
    const mockDb = openDatabaseSync();

    mockDb.getFirstAsync.mockResolvedValue({
      source_id: "test-1",
      title: "Test",
      author: "Author",
      version: "1.0.0",
      content: "{}",
      installed_at: "2024-01-01",
    });

    const exists = await courseExists("test-1");

    expect(exists).toBe(true);
    expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
      "SELECT 1 FROM courses WHERE source_id = ?",
      ["test-1"],
    );
  });

  it("returns false for non-existent course", async () => {
    const { openDatabaseSync } = require("expo-sqlite");
    const mockDb = openDatabaseSync();

    mockDb.getFirstAsync.mockResolvedValue(null);

    const exists = await courseExists("nonexistent");

    expect(exists).toBe(false);
  });

  it("replaces an existing course, preserving progress", async () => {
    const { openDatabaseSync } = require("expo-sqlite");
    const mockDb = openDatabaseSync();

    await replaceCourse("test-1", {
      source_id: "test-1",
      title: "Updated Course",
      author: "Updated Author",
      version: "2.0.0",
      content: '{"topics":[]}',
    });

    expect(mockDb.runAsync).toHaveBeenCalled();
    const call = mockDb.runAsync.mock.calls[0];
    expect(call[0]).toContain("UPDATE courses");
    expect(call[0]).toContain("WHERE source_id = ?");
  });

  it("deletes a course by source_id", async () => {
    const { openDatabaseSync } = require("expo-sqlite");
    const mockDb = openDatabaseSync();

    await deleteCourse("test-1");

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      "DELETE FROM courses WHERE source_id = ?",
      ["test-1"],
    );
  });
});
