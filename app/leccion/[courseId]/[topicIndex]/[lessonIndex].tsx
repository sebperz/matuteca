import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState, useCallback, useRef } from "react";
import { useCourseStore } from "../../../../src/stores/courseStore";
import { useTheme } from "../../../../src/theme/theme";
import { TextScreenRenderer } from "../../../../src/lesson/TextScreenRenderer";
import { saveScreenProgress, getLessonProgress, markLessonCompleted } from "../../../../src/db/progress";
import { MultipleChoice } from "../../../../src/lesson/MultipleChoice";
import { DragDrop } from "../../../../src/lesson/DragDrop";
import { EndScreen } from "../../../../src/lesson/EndScreen";
import { useStreakStore } from "../../../../src/stores/streakStore";

export default function LessonViewer() {
  const { courseId, topicIndex, lessonIndex } = useLocalSearchParams<{
    courseId: string;
    topicIndex: string;
    lessonIndex: string;
  }>();
  const router = useRouter();
  const { colors } = useTheme();
  const courses = useCourseStore((s) => s.courses);

  const [currentScreen, setCurrentScreen] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const course = courses.find((c) => c.source_id === courseId);
  const topic = course?.topics[parseInt(topicIndex, 10)];
  const lesson = topic?.lessons[parseInt(lessonIndex, 10)];

  useEffect(() => {
    if (!courseId || topicIndex === undefined || lessonIndex === undefined) return;
    getLessonProgress(courseId, parseInt(topicIndex, 10), parseInt(lessonIndex, 10)).then(
      (progress) => {
        if (progress) {
          setCurrentScreen(progress.screen_index);
        }
        setIsLoading(false);
      },
    );
  }, [courseId, topicIndex, lessonIndex]);

  if (!lesson || !course) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Lección no encontrada</Text>
      </View>
    );
  }

  const screens = lesson.screens;
  const screen = screens[currentScreen];
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const recordLesson = useStreakStore((s) => s.recordLesson);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [currentScreen]);

  useEffect(() => {
    if (screen.type === "end") {
      markLessonCompleted(course.source_id, parseInt(topicIndex, 10), parseInt(lessonIndex, 10));
      recordLesson();
    }
  }, [screen.type]);

  const goToScreen = async (index: number) => {
    if (index < 0 || index >= screens.length) return;
    setCurrentScreen(index);
    await saveScreenProgress(
      course.source_id,
      parseInt(topicIndex, 10),
      parseInt(lessonIndex, 10),
      index,
    );
  };

  const handleBack = () => {
    if (currentScreen === 0) {
      router.back();
    } else {
      goToScreen(currentScreen - 1);
    }
  };

  if (isLoading) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>
            ← Volver
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {lesson.title}
        </Text>
        <View style={styles.progressContainer}>
          {screens.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    i <= currentScreen ? colors.primary : colors.border,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <Animated.View style={[styles.screenContent, { opacity: fadeAnim }]}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>
          {screen.title}
        </Text>

        {screen.type === "text" && (
          <TextScreenRenderer nodes={screen.nodes} />
        )}
        {screen.type === "multiple-choice" && (
          <MultipleChoice
            screen={screen}
            onContinue={() => goToScreen(currentScreen + 1)}
          />
        )}
        {screen.type === "drag-drop" && (
          <DragDrop
            screen={screen}
            onContinue={() => goToScreen(currentScreen + 1)}
          />
        )}
        {screen.type === "end" && (
          <EndScreen
            lessonTitle={lesson.title}
            hasNextLesson={parseInt(lessonIndex, 10) < (topic?.lessons.length ?? 0) - 1}
            onGoHome={() => router.replace("/")}
            onNextLesson={() => {
              router.replace(
                `/leccion/${courseId}/${topicIndex}/${parseInt(lessonIndex, 10) + 1}`,
              );
            }}
          />
        )}
      </Animated.View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {currentScreen + 1} / {screens.length}
        </Text>
        {screen.type === "text" && currentScreen < screens.length - 1 && (
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: colors.primary }]}
            onPress={() => goToScreen(currentScreen + 1)}
          >
            <Text style={styles.continueText}>Continuar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingVertical: 4,
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    fontFamily: "Geist",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Geist-SemiBold",
    textAlign: "center",
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  screenContent: {
    flex: 1,
    padding: 24,
  },
  screenTitle: {
    fontSize: 22,
    fontFamily: "Geist-Bold",
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 16,
    fontFamily: "Geist",
    marginTop: 32,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
  },
  progressText: {
    fontSize: 14,
    fontFamily: "Geist-Mono",
  },
  continueButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Geist-SemiBold",
  },
});
