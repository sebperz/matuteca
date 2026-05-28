import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../src/theme/theme";
import { useSettingsStore } from "../../src/stores/settingsStore";
import { useStreakStore } from "../../src/stores/streakStore";
import { useCourseStore } from "../../src/stores/courseStore";
import { getSetting, setSetting } from "../../src/db/settings";
import { getDatabase } from "../../src/db/database";

type ThemeOption = "system" | "light" | "dark";

const THEME_LABELS: Record<ThemeOption, string> = {
  system: "Sistema",
  light: "Claro",
  dark: "Oscuro",
};

export default function Profile() {
  const { colors } = useTheme();
  const { theme, setTheme } = useSettingsStore();
  const { courses } = useCourseStore();
  const { maxStreak } = useStreakStore();

  const [completedLessons, setCompletedLessons] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(5);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalValue, setGoalValue] = useState("5");

  useEffect(() => {
    async function load() {
      const db = getDatabase();
      const row = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM lesson_progress WHERE completed = 1",
      );
      setCompletedLessons(row?.count ?? 0);

      const savedGoal = await getSetting("weeklyGoal");
      if (savedGoal) {
        const g = parseInt(savedGoal, 10);
        setWeeklyGoal(g);
        setGoalValue(String(g));
      }
    }
    load();
  }, []);

  const handleThemeChange = async (option: ThemeOption) => {
    setTheme(option);
    await setSetting("theme", option);
    setShowThemePicker(false);
  };

  const handleGoalSave = async () => {
    const g = parseInt(goalValue, 10);
    if (isNaN(g) || g < 1) return;
    setWeeklyGoal(g);
    await setSetting("weeklyGoal", String(g));
    setShowGoalModal(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.section, { borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          Mi cuenta
        </Text>
        <View style={[styles.placeholder]}>
          <Text style={[styles.placeholderText, { color: colors.muted }]}>
            Próximamente
          </Text>
        </View>
      </View>

      <View style={[styles.section, { borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          Estadísticas
        </Text>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: colors.text }]}>
            Mejor racha
          </Text>
          <Text style={[styles.statValue, { color: colors.textSecondary }]}>
            {maxStreak} días
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: colors.text }]}>
            Cursos instalados
          </Text>
          <Text style={[styles.statValue, { color: colors.textSecondary }]}>
            {courses.length}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: colors.text }]}>
            Lecciones completadas
          </Text>
          <Text style={[styles.statValue, { color: colors.textSecondary }]}>
            {completedLessons}
          </Text>
        </View>
      </View>

      <View style={[styles.section, { borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          Preferencias
        </Text>
        <Pressable
          style={styles.settingRow}
          onPress={() => setShowThemePicker(true)}
        >
          <Text style={[styles.settingLabel, { color: colors.text }]}>Tema</Text>
          <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
            {THEME_LABELS[theme as ThemeOption] ?? "Sistema"}
          </Text>
        </Pressable>
        <Pressable
          style={styles.settingRow}
          onPress={() => {
            setGoalValue(String(weeklyGoal));
            setShowGoalModal(true);
          }}
        >
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Meta semanal
          </Text>
          <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
            {weeklyGoal} lecciones
          </Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          Acerca de
        </Text>
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutText, { color: colors.text }]}>Matuteca</Text>
          <Text style={[styles.aboutSecondary, { color: colors.textSecondary }]}>
            v1.0.0
          </Text>
        </View>
        <Text style={[styles.aboutSecondary, { color: colors.textSecondary }]}>
          Licencia MIT
        </Text>
        <Text style={[styles.aboutSecondary, { color: colors.textSecondary }]}>
          Sebastián Pérez
        </Text>
      </View>

      <Modal
        visible={showThemePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemePicker(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowThemePicker(false)}
        >
          <View style={[styles.actionSheet, { backgroundColor: colors.surface }]}>
            {(["system", "light", "dark"] as ThemeOption[]).map((option) => (
              <Pressable
                key={option}
                style={[styles.actionSheetItem, { borderBottomColor: colors.border }]}
                onPress={() => handleThemeChange(option)}
              >
                <Text
                  style={[
                    styles.actionSheetText,
                    {
                      color: colors.text,
                      fontFamily:
                        theme === option ? "Geist-SemiBold" : "Geist",
                    },
                  ]}
                >
                  {THEME_LABELS[option]}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={showGoalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoalModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowGoalModal(false)}
        >
          <View style={[styles.goalModal, { backgroundColor: colors.background }]}>
            <Text style={[styles.goalModalTitle, { color: colors.text }]}>
              Meta semanal
            </Text>
            <View style={styles.stepper}>
              <Pressable
                style={[styles.stepperButton, { borderColor: colors.border }]}
                onPress={() =>
                  setGoalValue((v) => String(Math.max(1, parseInt(v || "1", 10) - 1)))
                }
              >
                <Text style={[styles.stepperButtonText, { color: colors.text }]}>−</Text>
              </Pressable>
              <Text style={[styles.stepperValue, { color: colors.text }]}>
                {goalValue}
              </Text>
              <Pressable
                style={[styles.stepperButton, { borderColor: colors.border }]}
                onPress={() =>
                  setGoalValue((v) => String(parseInt(v || "5", 10) + 1))
                }
              >
                <Text style={[styles.stepperButtonText, { color: colors.text }]}>+</Text>
              </Pressable>
            </View>
            <Pressable
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleGoalSave}
            >
              <Text style={styles.saveButtonText}>Guardar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: "Geist-SemiBold",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  placeholder: {
    paddingVertical: 12,
  },
  placeholderText: {
    fontSize: 15,
    fontFamily: "Geist",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 15,
    fontFamily: "Geist",
  },
  statValue: {
    fontSize: 15,
    fontFamily: "Geist-Mono",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: "Geist",
  },
  settingValue: {
    fontSize: 15,
    fontFamily: "Geist",
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  aboutText: {
    fontSize: 15,
    fontFamily: "Geist",
  },
  aboutSecondary: {
    fontSize: 14,
    fontFamily: "Geist",
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  actionSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 40,
  },
  actionSheetItem: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  actionSheetText: {
    fontSize: 17,
    fontFamily: "Geist",
    textAlign: "center",
  },
  goalModal: {
    margin: 24,
    borderRadius: 16,
    padding: 24,
    alignSelf: "center",
    width: "100%",
    maxWidth: 320,
  },
  goalModalTitle: {
    fontSize: 18,
    fontFamily: "Geist-SemiBold",
    textAlign: "center",
    marginBottom: 20,
  },
  stepper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginBottom: 24,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperButtonText: {
    fontSize: 22,
    fontFamily: "Geist",
  },
  stepperValue: {
    fontSize: 28,
    fontFamily: "Geist-Bold",
    minWidth: 48,
    textAlign: "center",
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Geist-SemiBold",
  },
});
