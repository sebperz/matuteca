import { importCourse, importOrReplaceCourse } from "../import";
import { initDatabase } from "../db/database";
import { getAllCourses } from "../db/courses";

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

const VALID_MD = `---
source_id: test-1
title: Test Course
author: Test Author
---

# Tema: Test Topic

## Lección: Test Lesson

### Pantalla: Test Screen

Hello.
`;

describe("importCourse", () => {
  beforeEach(async () => {
    await initDatabase();
    jest.clearAllMocks();
  });

  it("parses valid markdown and inserts it into the database", async () => {
    const { openDatabaseSync } = require("expo-sqlite");
    const mockDb = openDatabaseSync();

    const result = await importCourse(VALID_MD);

    expect(result.source_id).toBe("test-1");
    expect(result.title).toBe("Test Course");
    expect(result.author).toBe("Test Author");
    expect(result.topics).toHaveLength(1);

    expect(mockDb.runAsync).toHaveBeenCalled();
    const insertCall = mockDb.runAsync.mock.calls[0];
    expect(insertCall[0]).toContain("INSERT INTO courses");
    expect(insertCall[1][0]).toBe("test-1");
  });

  it("throws with parse errors for invalid content", async () => {
    const invalidMd = `---
source_id: test-1
---

# Tema: Test
`;

    await expect(importCourse(invalidMd)).rejects.toThrow(
      "title is required in frontmatter",
    );
  });

  it("importOrReplaceCourse detects duplicate and replaces existing course", async () => {
    const { openDatabaseSync } = require("expo-sqlite");
    const mockDb = openDatabaseSync();

    mockDb.getFirstAsync.mockResolvedValue({
      source_id: "test-1",
      title: "Old",
      author: "Old",
      version: "1.0.0",
      content: "{}",
      installed_at: "2024-01-01",
    });

    const result = await importOrReplaceCourse(VALID_MD);

    expect(result.course.source_id).toBe("test-1");
    expect(result.replaced).toBe(true);

    expect(mockDb.runAsync).toHaveBeenCalled();
    const updateCall = mockDb.runAsync.mock.calls.find(
      (call: string[]) => call[0].includes("UPDATE courses"),
    );
    expect(updateCall).toBeDefined();
  });
});
