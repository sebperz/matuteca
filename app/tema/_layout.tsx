import { Stack } from "expo-router";

export default function TemaLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="[courseId]" />
    </Stack>
  );
}
