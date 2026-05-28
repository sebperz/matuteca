import { initDatabase } from "../db/database";
import { saveScreenProgress, getLessonProgress, markLessonCompleted } from "../db/progress";

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

describe("lesson progress", () => {
  beforeEach(async () => {
    await initDatabase();
    jest.clearAllMocks();
  });

  it("saves and retrieves screen progress", async () => {
    const { openDatabaseSync } = require("expo-sqlite");
    const mockDb = openDatabaseSync();

    mockDb.getFirstAsync.mockResolvedValue({
      source_id: "test-1",
      topic_index: 0,
      lesson_index: 1,
      screen_index: 3,
      completed: 0,
    });

    await saveScreenProgress("test-1", 0, 1, 3);

    expect(mockDb.runAsync).toHaveBeenCalled();

    const progress = await getLessonProgress("test-1", 0, 1);

    expect(progress).not.toBeNull();
    expect(progress!.screen_index).toBe(3);
    expect(progress!.completed).toBe(false);
  });

  it("returns null for non-existent progress", async () => {
    const { openDatabaseSync } = require("expo-sqlite");
    const mockDb = openDatabaseSync();

    mockDb.getFirstAsync.mockResolvedValue(null);

    const progress = await getLessonProgress("test-1", 0, 1);

    expect(progress).toBeNull();
  });

  it("marks a lesson as completed", async () => {
    const { openDatabaseSync } = require("expo-sqlite");
    const mockDb = openDatabaseSync();

    await markLessonCompleted("test-1", 0, 1);

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE lesson_progress"),
      expect.arrayContaining(["test-1", 0, 1]),
    );
  });
});
