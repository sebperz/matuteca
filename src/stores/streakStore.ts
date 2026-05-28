import { create } from "zustand";
import { getDailyActivity, recordDailyActivity } from "../db/activity";
import {
  computeStreak,
  computeMaxStreak,
  computeFreezesEarned,
  computeFreezesToConsume,
  computeWeeklyProgress,
} from "../streak/engine";
import { useSettingsStore } from "./settingsStore";

interface StreakState {
  streak: number;
  maxStreak: number;
  freezes: number;
  weeklyGoal: number;
  weeklyProgress: number;
  isLoading: boolean;

  hydrate: () => Promise<void>;
  recordLesson: () => Promise<void>;
}

export const useStreakStore = create<StreakState>((set, get) => ({
  streak: 0,
  maxStreak: 0,
  freezes: 0,
  weeklyGoal: 5,
  weeklyProgress: 0,
  isLoading: false,

  hydrate: async () => {
    set({ isLoading: true });
    const rows = await getDailyActivity();
    const activity = rows.map((r) => ({
      date: r.date,
      lessons_completed: r.lessons_completed,
    }));

    const streak = computeStreak(activity);
    const maxStreak = computeMaxStreak(activity, get().maxStreak);
    const freezesEarned = computeFreezesEarned(activity);
    const hasActivityToday = rows.some(
      (r) => r.date === new Date().toISOString().split("T")[0],
    );
    const freezesConsumed = computeFreezesToConsume(
      get().freezes + freezesEarned,
      hasActivityToday,
    );
    const weeklyProgress = computeWeeklyProgress(activity);

    set({
      streak,
      maxStreak,
      freezes: get().freezes + freezesEarned - freezesConsumed,
      weeklyProgress,
      isLoading: false,
    });
  },

  recordLesson: async () => {
    await recordDailyActivity();
    await get().hydrate();
  },
}));
