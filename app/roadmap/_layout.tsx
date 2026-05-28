import { Stack } from "expo-router";

export default function RoadmapLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="[courseId]/[topicIndex]" />
    </Stack>
  );
}
