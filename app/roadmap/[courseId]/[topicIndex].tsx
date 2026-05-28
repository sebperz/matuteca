import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCourseStore } from "../../../src/stores/courseStore";
import { useTheme } from "../../../src/theme/theme";

export default function Roadmap() {
  const { courseId, topicIndex } = useLocalSearchParams<{
    courseId: string;
    topicIndex: string;
  }>();
  const router = useRouter();
  const { colors } = useTheme();
  const course = useCourseStore((s) =>
    s.courses.find((c) => c.source_id === courseId),
  );
  const topic = course?.topics[parseInt(topicIndex, 10)];

  if (!topic) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Tema no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: topic.title }} />

      <ScrollView contentContainerStyle={styles.scroll}>
        {topic.lessons.map((lesson, i) => (
          <View key={i} style={styles.timelineRow}>
            <View style={styles.timelineLine}>
              <View
                style={[
                  styles.timelineDot,
                  { backgroundColor: colors.primary },
                ]}
              />
              {i < topic.lessons.length - 1 && (
                <View
                  style={[
                    styles.timelineConnector,
                    { backgroundColor: colors.border },
                  ]}
                />
              )}
            </View>

            <Pressable
              style={[styles.lessonCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() =>
                router.push(
                  `/leccion/${courseId}/${topicIndex}/${i}`,
                )
              }
            >
              <Text style={[styles.lessonTitle, { color: colors.text }]}>
                {lesson.title}
              </Text>
              <Text style={[styles.lessonScreens, { color: colors.textSecondary }]}>
                {lesson.screens.length} pantallas
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
  },
  timelineRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  timelineLine: {
    width: 32,
    alignItems: "center",
    paddingTop: 18,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    marginTop: 4,
    minHeight: 32,
  },
  lessonCard: {
    flex: 1,
    padding: 14,
    marginBottom: 8,
    marginLeft: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  lessonTitle: {
    fontSize: 15,
    fontFamily: "Geist-SemiBold",
  },
  lessonScreens: {
    fontSize: 13,
    fontFamily: "Geist",
    marginTop: 4,
  },
});
