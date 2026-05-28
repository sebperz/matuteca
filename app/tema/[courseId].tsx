import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCourseStore } from "../../src/stores/courseStore";
import { useTheme } from "../../src/theme/theme";

export default function TopicView() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const course = useCourseStore((s) =>
    s.courses.find((c) => c.source_id === courseId),
  );

  if (!course) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Curso no encontrado</Text>
      </View>
    );
  }

  const totalLessons = course.topics.reduce(
    (acc, t) => acc + t.lessons.length,
    0,
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: course.title }} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.courseTitle, { color: colors.text }]}>
          {course.title}
        </Text>
        <Text style={[styles.courseAuthor, { color: colors.textSecondary }]}>
          {course.author}
        </Text>
        <Text style={[styles.courseMeta, { color: colors.textSecondary }]}>
          {course.topics.length} temas · {totalLessons} lecciones
        </Text>
      </View>

      <ScrollView>
        {course.topics.map((topic, i) => (
          <Pressable
            key={i}
            style={[styles.topicCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() =>
              router.push(`/roadmap/${courseId}/${i}`)
            }
          >
            <Text style={[styles.topicTitle, { color: colors.text }]}>
              {topic.title}
            </Text>
            <Text style={[styles.topicMeta, { color: colors.textSecondary }]}>
              {topic.lessons.length} lecciones
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  courseTitle: {
    fontSize: 22,
    fontFamily: "Geist-Bold",
  },
  courseAuthor: {
    fontSize: 15,
    fontFamily: "Geist",
    marginTop: 4,
  },
  courseMeta: {
    fontSize: 13,
    fontFamily: "Geist-Mono",
    marginTop: 8,
  },
  topicCard: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontFamily: "Geist-SemiBold",
  },
  topicMeta: {
    fontSize: 14,
    fontFamily: "Geist",
    marginTop: 4,
  },
});
