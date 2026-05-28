import {
  computeStreak,
  computeMaxStreak,
  computeFreezesEarned,
  computeFreezesToConsume,
  computeWeeklyProgress,
} from "../streak/engine";

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

function mondayStr(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d.toISOString().split("T")[0];
}

describe("streak engine", () => {
  describe("computeStreak", () => {
    it("returns 0 when no activity", () => {
      expect(computeStreak([])).toBe(0);
    });

    it("returns 1 when today has activity", () => {
      expect(computeStreak([{ date: dateStr(0), lessons_completed: 1 }])).toBe(1);
    });

    it("returns consecutive days count", () => {
      expect(
        computeStreak([
          { date: dateStr(0), lessons_completed: 2 },
          { date: dateStr(1), lessons_completed: 1 },
          { date: dateStr(2), lessons_completed: 3 },
        ]),
      ).toBe(3);
    });

    it("breaks streak when there is a gap", () => {
      expect(
        computeStreak([
          { date: dateStr(0), lessons_completed: 1 },
          { date: dateStr(2), lessons_completed: 1 },
        ]),
      ).toBe(1);
    });

    it("counts from today backwards", () => {
      expect(
        computeStreak([
          { date: dateStr(1), lessons_completed: 1 },
          { date: dateStr(2), lessons_completed: 1 },
        ]),
      ).toBe(0);
    });
  });

  describe("computeMaxStreak", () => {
    it("returns 0 with no activity", () => {
      expect(computeMaxStreak([], 0)).toBe(0);
    });

    it("returns max of historical max and current streak", () => {
      expect(computeMaxStreak([], 5)).toBe(5);
    });

    it("returns current streak when higher than max", () => {
      const activity = [{ date: dateStr(0), lessons_completed: 1 }];
      expect(computeMaxStreak(activity, 0)).toBe(1);
    });

    it("never decreases", () => {
      const activity = [{ date: dateStr(0), lessons_completed: 1 }];
      expect(computeMaxStreak(activity, 10)).toBe(10);
    });
  });

  describe("computeFreezesEarned", () => {
    it("returns 0 for no activity", () => {
      expect(computeFreezesEarned([])).toBe(0);
    });

    it("returns 0 when less than 4 lessons completed", () => {
      const activity = [
        { date: mondayStr(), lessons_completed: 1 },
      ];
      expect(computeFreezesEarned(activity)).toBe(0);
    });

    it("returns 1 when 4 lessons completed last week", () => {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      const lastWeekDay = d.toISOString().split("T")[0];
      const activity = [
        { date: lastWeekDay, lessons_completed: 4 },
      ];
      expect(computeFreezesEarned(activity)).toBe(1);
    });

    it("returns 1 when more than 4 lessons completed last week", () => {
      const d = new Date();
      d.setDate(d.getDate() - 9);
      const lastWeekDay = d.toISOString().split("T")[0];
      const activity = [
        { date: lastWeekDay, lessons_completed: 5 },
      ];
      expect(computeFreezesEarned(activity)).toBe(1);
    });
  });

  describe("computeFreezesToConsume", () => {
    it("returns 0 when today has activity", () => {
      expect(computeFreezesToConsume(1, true)).toBe(0);
    });

    it("returns 1 when no activity and has freezes", () => {
      expect(computeFreezesToConsume(2, false)).toBe(1);
    });

    it("returns 0 when no freezes available", () => {
      expect(computeFreezesToConsume(0, false)).toBe(0);
    });
  });

  describe("computeWeeklyProgress", () => {
    it("returns count of completed lessons this week", () => {
      const activity = [
        { date: mondayStr(), lessons_completed: 2 },
        { date: dateStr(0), lessons_completed: 1 },
      ];
      expect(computeWeeklyProgress(activity)).toBe(3);
    });

    it("ignores activity from previous weeks", () => {
      const d = new Date();
      d.setDate(d.getDate() - 14);
      const twoWeeksAgo = d.toISOString().split("T")[0];
      const activity = [
        { date: twoWeeksAgo, lessons_completed: 10 },
      ];
      expect(computeWeeklyProgress(activity)).toBe(0);
    });

    it("resets on Monday", () => {
      const prevMonday = new Date();
      prevMonday.setDate(prevMonday.getDate() - 7);
      const prevMondayStr = prevMonday.toISOString().split("T")[0];
      const activity = [
        { date: prevMondayStr, lessons_completed: 10 },
      ];
      expect(computeWeeklyProgress(activity)).toBe(0);
    });
  });
});
