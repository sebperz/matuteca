import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Slot, SplashScreen } from "expo-router";
import { ThemeProvider, useTheme } from "../src/theme/theme";
import { initDatabase } from "../src/db/database";
import { getAllCourses } from "../src/db/courses";
import { loadBuiltInCourses } from "../src/import/builtin";
import { BUILT_IN_COURSES } from "../src/data/builtin-courses";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Geist: require("../assets/fonts/Geist-Regular.ttf"),
    "Geist-Bold": require("../assets/fonts/Geist-Bold.ttf"),
    "Geist-SemiBold": require("../assets/fonts/Geist-SemiBold.ttf"),
    "Geist-Mono": require("../assets/fonts/GeistMono-Regular.ttf"),
    "Geist-Mono-Bold": require("../assets/fonts/GeistMono-Bold.ttf"),
    "Geist-Mono-SemiBold": require("../assets/fonts/GeistMono-SemiBold.ttf"),
  });

  useEffect(() => {
    async function setup() {
      await initDatabase();
      const existing = await getAllCourses();
      if (existing.length === 0) {
        await loadBuiltInCourses(BUILT_IN_COURSES);
      }
    }
    setup();
  }, []);

  if (!loaded) return null;

  SplashScreen.hideAsync();

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { colors } = useTheme();

  return (
    <Slot
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
