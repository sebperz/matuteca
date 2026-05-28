import { Appearance } from "react-native";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { ThemeMode, useSettingsStore } from "../stores/settingsStore";

export type ResolvedTheme = "light" | "dark";

export function resolveTheme(
  systemScheme: ResolvedTheme,
  preference: ThemeMode,
): ResolvedTheme {
  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  return systemScheme;
}

export const lightColors = {
  background: "#FFFFFF",
  surface: "#F5F5F7",
  text: "#1D1D1F",
  textSecondary: "#6E6E73",
  border: "#E5E5E7",
  primary: "#2563EB",
  success: "#16A34A",
  error: "#DC2626",
  muted: "#9CA3AF",
} as const;

export const darkColors = {
  background: "#000000",
  surface: "#1C1C1E",
  text: "#F5F5F7",
  textSecondary: "#A1A1A6",
  border: "#38383A",
  primary: "#3B82F6",
  success: "#22C55E",
  error: "#EF4444",
  muted: "#6B7280",
} as const;

export interface Colors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  success: string;
  error: string;
  muted: string;
}

export function getColors(theme: ResolvedTheme): Colors {
  return theme === "dark" ? darkColors : lightColors;
}

interface ThemeContextValue {
  theme: ResolvedTheme;
  colors: Colors;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  colors: lightColors,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const storedTheme = useSettingsStore((s) => s.theme);
  const systemScheme = Appearance.getColorScheme() ?? "light";
  const resolved = resolveTheme(
    systemScheme as ResolvedTheme,
    storedTheme,
  );
  const colors = useMemo(() => getColors(resolved), [resolved]);

  return (
    <ThemeContext.Provider value={{ theme: resolved, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
