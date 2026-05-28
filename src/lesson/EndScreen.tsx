import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/theme";

interface Props {
  lessonTitle: string;
  hasNextLesson: boolean;
  onGoHome: () => void;
  onNextLesson: () => void;
}

export function EndScreen({
  lessonTitle,
  hasNextLesson,
  onGoHome,
  onNextLesson,
}: Props) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.checkmark,
          {
            backgroundColor: colors.success,
            transform: [{ scale }],
          },
        ]}
      >
        <Text style={styles.checkmarkText}>✓</Text>
      </Animated.View>

      <Text style={[styles.title, { color: colors.text }]}>
        ¡Lección completada!
      </Text>

      <Text style={[styles.lessonName, { color: colors.textSecondary }]}>
        {lessonTitle}
      </Text>

      <View style={styles.buttons}>
        <Pressable
          style={[styles.homeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={onGoHome}
        >
          <Text style={[styles.homeButtonText, { color: colors.text }]}>
            Inicio
          </Text>
        </Pressable>

        {hasNextLesson && (
          <Pressable
            style={[styles.nextButton, { backgroundColor: colors.primary }]}
            onPress={onNextLesson}
          >
            <Text style={styles.nextButtonText}>Siguiente</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  checkmark: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  checkmarkText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontFamily: "Geist-Bold",
  },
  title: {
    fontSize: 22,
    fontFamily: "Geist-Bold",
    marginBottom: 8,
  },
  lessonName: {
    fontSize: 16,
    fontFamily: "Geist",
    marginBottom: 32,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
  },
  homeButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  homeButtonText: {
    fontSize: 16,
    fontFamily: "Geist-SemiBold",
  },
  nextButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Geist-SemiBold",
  },
});
