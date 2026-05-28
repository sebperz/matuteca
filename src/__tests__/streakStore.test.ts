import { useStreakStore } from "../stores/streakStore";

describe("useStreakStore", () => {
  it("returns default streak values and is not loading", () => {
    const state = useStreakStore.getState();

    expect(state.streak).toBe(0);
    expect(state.maxStreak).toBe(0);
    expect(state.freezes).toBe(0);
    expect(state.weeklyGoal).toBe(5);
    expect(state.weeklyProgress).toBe(0);
    expect(state.isLoading).toBe(false);
  });
});
