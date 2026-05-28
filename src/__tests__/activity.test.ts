import { initDatabase } from "../db/database";
import { getRecentProgress, getWeeklyLessonCount } from "../db/activity";

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

describe("activity queries", () => {
  beforeEach(async () => {
    await initDatabase();
    jest.clearAllMocks();
  });

  it("getRecentProgress returns most recent lesson progress", async () => {
    const { openDatabaseSync } = require("expo-sqlite");
    const mockDb = openDatabaseSync();

    mockDb.getFirstAsync.mockResolvedValue({
      source_id: "test-1",
      topic_index: 0,
      lesson_index: 1,
      screen_index: 2,
      completed: 0,
    });

    const progress = await getRecentProgress();

    expect(progress).not.toBeNull();
    expect(progress!.source_id).toBe("test-1");
    expect(progress!.screen_index).toBe(2);
  });

  it("getRecentProgress returns null when no progress exists", async () => {
    const { openDatabaseSync } = require("expo-sqlite");
    const mockDb = openDatabaseSync();

    mockDb.getFirstAsync.mockResolvedValue(null);

    const progress = await getRecentProgress();

    expect(progress).toBeNull();
  });

  it("getWeeklyLessonCount counts completed lessons this week", async () => {
    const { openDatabaseSync } = require("expo-sqlite");
    const mockDb = openDatabaseSync();

    mockDb.getFirstAsync.mockResolvedValue({ count: 3 });

    const count = await getWeeklyLessonCount();

    expect(count).toBe(3);
  });
});
