import { initDatabase } from "../db/database";

jest.mock("expo-sqlite", () => {
  const mockDb = {
    execAsync: jest.fn(),
    runAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
  };
  return {
    openDatabaseSync: jest.fn(() => mockDb),
  };
});

describe("database", () => {
  it("initializes with courses, lesson_progress, daily_activity, freezes, and settings tables", async () => {
    await initDatabase();

    const { openDatabaseSync } = require("expo-sqlite");
    const mockDb = openDatabaseSync();

    expect(mockDb.execAsync).toHaveBeenCalled();

    const sql = mockDb.execAsync.mock.calls[0][0] as string;

    expect(sql).toContain("CREATE TABLE IF NOT EXISTS courses");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS lesson_progress");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS daily_activity");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS freezes");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS settings");
  });
});
