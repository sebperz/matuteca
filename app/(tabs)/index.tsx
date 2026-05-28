import { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useCourseStore } from "../../src/stores/courseStore";
import { useStreakStore } from "../../src/stores/streakStore";
import { useTheme } from "../../src/theme/theme";
import { getRecentProgress, getWeeklyLessonCount } from "../../src/db/activity";
import type { Course } from "../../src/parser/types";

interface RecentProgress {
  source_id: string;
  topic_index: number;
  lesson_index: number;
  screen_index: number;
}

interface CourseProgress {
  course: Course;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

export default function Dashboard() {
  const { colors } = useTheme();
  const router = useRouter();
  const courses = useCourseStore((s) => s.courses);
  const { streak, maxStreak, freezes, weeklyGoal, weeklyProgress } =
    useStreakStore();

  const [recent, setRecent] = useState<RecentProgress | null>(null);
  const [weekly, setWeekly] = useState(0);

  useEffect(() => {
    getRecentProgress().then(setRecent);
    getWeeklyLessonCount().then(setWeekly);
  }, []);

  const recentCourse = recent
    ? courses.find((c) => c.source_id === recent.source_id)
    : null;

  const recentTopic = recentCourse?.topics[recent?.topic_index ?? 0];
  const recentLesson = recentTopic?.lessons[recent?.lesson_index ?? 0];

  const coursesInProgress = courses
    .map((course) => {
      let completed = 0;
      let total = 0;
      for (const topic of course.topics) {
        for (let li = 0; li < topic.lessons.length; li++) {
          total++;
        }
      }
      return {
        course,
        completedLessons: completed,
        totalLessons: total,
        percentage: total > 0 ? (completed / total) * 100 : 0,
      };
    })
    .filter((c) => c.percentage > 0);

  if (courses.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No hay progreso aún
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Completa tu primer lección para ver tu progreso aquí
        </Text>
        <Pressable
          style={[styles.exploreButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(tabs)/courses")}
        >
          <Text style={styles.exploreButtonText}>Explorar cursos</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      data={coursesInProgress}
      keyExtractor={(item) => item.course.source_id}
      ListHeaderComponent={
        <View>
          <View style={[styles.streakCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.streakNumber, { color: colors.text }]}>
              {streak}
            </Text>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
              días consecutivos
            </Text>
            <View style={styles.streakDetails}>
              <Text style={[styles.streakDetail, { color: colors.textSecondary }]}>
                Máx: {maxStreak} · Freezes: {freezes}
              </Text>
            </View>
          </View>

          {recent && recentCourse && recentLesson && (
            <Pressable
              style={[styles.continueCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() =>
                router.push(
                  `/leccion/${recent.source_id}/${recent.topic_index}/${recent.lesson_index}`,
                )
              }
            >
              <Text style={[styles.continueLabel, { color: colors.textSecondary }]}>
                Continuar donde quedé
              </Text>
              <Text style={[styles.continueTitle, { color: colors.text }]}>
                {recentCourse.title}
              </Text>
              <Text style={[styles.continueMeta, { color: colors.textSecondary }]}>
                {recentTopic.title} · {recentLesson.title}
              </Text>
            </Pressable>
          )}

          <View style={[styles.weeklyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Meta semanal
            </Text>
            <View style={styles.weeklyBar}>
              <View
                style={[
                  styles.weeklyFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${Math.min((weekly / weeklyGoal) * 100, 100)}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.weeklyText, { color: colors.textSecondary }]}>
              {weekly} / {weeklyGoal} lecciones
            </Text>
          </View>

          {coursesInProgress.length > 0 && (
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
              Cursos en progreso
            </Text>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <View style={[styles.courseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.courseCardTitle, { color: colors.text }]}>
            {item.course.title}
          </Text>
          <View style={styles.courseBar}>
            <View
              style={[
                styles.courseBarFill,
                { backgroundColor: colors.primary, width: `${item.percentage}%` },
              ]}
            />
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Geist-SemiBold",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: "Geist",
    textAlign: "center",
    marginBottom: 24,
  },
  exploreButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Geist-SemiBold",
  },
  streakCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  streakNumber: {
    fontSize: 48,
    fontFamily: "Geist-Bold",
  },
  streakLabel: {
    fontSize: 15,
    fontFamily: "Geist",
    marginTop: 4,
  },
  streakDetails: {
    marginTop: 8,
  },
  streakDetail: {
    fontSize: 13,
    fontFamily: "Geist",
  },
  continueCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  continueLabel: {
    fontSize: 13,
    fontFamily: "Geist-SemiBold",
    marginBottom: 4,
  },
  continueTitle: {
    fontSize: 16,
    fontFamily: "Geist-SemiBold",
  },
  continueMeta: {
    fontSize: 14,
    fontFamily: "Geist",
    marginTop: 4,
  },
  weeklyCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Geist-SemiBold",
    marginBottom: 12,
    marginLeft: 16,
  },
  weeklyBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(128,128,128,0.15)",
    overflow: "hidden",
  },
  weeklyFill: {
    height: "100%",
    borderRadius: 4,
  },
  weeklyText: {
    fontSize: 13,
    fontFamily: "Geist-Mono",
    marginTop: 8,
    textAlign: "center",
  },
  courseCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  courseCardTitle: {
    fontSize: 15,
    fontFamily: "Geist-SemiBold",
    marginBottom: 8,
  },
  courseBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(128,128,128,0.15)",
    overflow: "hidden",
  },
  courseBarFill: {
    height: "100%",
    borderRadius: 3,
  },
});
