import { Stack } from "expo-router";

export default function LeccionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[courseId]/[topicIndex]/[lessonIndex]" />
    </Stack>
  );
}
