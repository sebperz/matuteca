import { initDatabase } from "../db/database";
import { getSetting, setSetting } from "../db/settings";

jest.mock("expo-sqlite", () => {
  const mockDb = {
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync: jest.fn().mockResolvedValue({}),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    getAllAsync: jest.fn().mockResolvedValue([]),
  };
  return { openDatabaseSync: jest.fn(() => mockDb) };
});

describe("settings", () => {
  beforeEach(async () => {
    await initDatabase();
    jest.clearAllMocks();
  });

  it("sets and gets a setting", async () => {
    const { openDatabaseSync } = require("expo-sqlite");
    const mockDb = openDatabaseSync();

    mockDb.getFirstAsync.mockResolvedValue({ key: "theme", value: "dark" });

    await setSetting("theme", "dark");
    expect(mockDb.runAsync).toHaveBeenCalled();

    const value = await getSetting("theme");
    expect(value).toBe("dark");
  });

  it("returns null for unset setting", async () => {
    const { openDatabaseSync } = require("expo-sqlite");
    const mockDb = openDatabaseSync();
    mockDb.getFirstAsync.mockResolvedValue(null);
    expect(await getSetting("nonexistent")).toBeNull();
  });
});
