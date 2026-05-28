import { loadBuiltInCourses } from "../import/builtin";
import { initDatabase } from "../db/database";

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

const COURSE_A = `---
source_id: builtin-a
title: Course A
author: Author A
---

# Tema: Topic A

## Lección: Lesson A

### Pantalla: Screen A

Content A.
`;

const COURSE_B = `---
source_id: builtin-b
title: Course B
author: Author B
---

# Tema: Topic B

## Lección: Lesson B

### Pantalla: Screen B

Content B.
`;

describe("loadBuiltInCourses", () => {
  beforeEach(async () => {
    await initDatabase();
    jest.clearAllMocks();
  });

  it("imports all built-in courses", async () => {
    const { openDatabaseSync } = require("expo-sqlite");
    const mockDb = openDatabaseSync();

    const files = [
      { filename: "course-a.md", content: COURSE_A },
      { filename: "course-b.md", content: COURSE_B },
    ];

    const results = await loadBuiltInCourses(files);

    expect(results.imported).toHaveLength(2);
    expect(results.imported[0]).toBe("builtin-a");
    expect(results.imported[1]).toBe("builtin-b");
    expect(results.errors).toHaveLength(0);

    expect(mockDb.runAsync).toHaveBeenCalledTimes(2);
  });

  it("reports errors for invalid files without failing the batch", async () => {
    const { openDatabaseSync } = require("expo-sqlite");
    const mockDb = openDatabaseSync();

    const files = [
      { filename: "good.md", content: COURSE_A },
      { filename: "bad.md", content: "not valid content" },
    ];

    const results = await loadBuiltInCourses(files);

    expect(results.imported).toHaveLength(1);
    expect(results.imported[0]).toBe("builtin-a");
    expect(results.errors).toHaveLength(1);
    expect(results.errors[0].filename).toBe("bad.md");
  });
});
