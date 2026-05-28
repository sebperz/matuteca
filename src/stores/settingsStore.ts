import { create } from "zustand";

export type ThemeMode = "system" | "light" | "dark";

interface SettingsState {
  theme: ThemeMode;
  isLoading: boolean;
  setTheme: (theme: ThemeMode) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: "system",
  isLoading: false,
  setTheme: (theme) => set({ theme }),
}));
