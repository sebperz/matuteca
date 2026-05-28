import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useCourseStore } from "../../src/stores/courseStore";
import { useTheme } from "../../src/theme/theme";
import { getAllCourses, deleteCourse } from "../../src/db/courses";

export default function Courses() {
  const { colors } = useTheme();
  const { courses, setCourses, removeCourse } = useCourseStore();
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const rows = await getAllCourses();
      const parsed = rows
        .map((r) => {
          try { return JSON.parse(r.content); } catch { return null; }
        })
        .filter(Boolean);
      setCourses(parsed);
    }
    load();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteCourse(deleteTarget);
    removeCourse(deleteTarget);
    setDeleteTarget(null);
  };

  if (courses.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No hay cursos instalados
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Importa tu primer archivo .md para comenzar
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.source_id}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push(`/tema/${item.source_id}`)}
            onLongPress={() => setDeleteTarget(item.source_id)}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.cardAuthor, { color: colors.textSecondary }]}>
              {item.author}
            </Text>
            <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>
              {item.topics.length} temas · {item.topics.reduce((acc, t) => acc + t.lessons.length, 0)} lecciones
            </Text>
          </Pressable>
        )}
      />

      <Modal
        visible={deleteTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Eliminar curso
            </Text>
            <Text style={[styles.modalBody, { color: colors.textSecondary }]}>
              ¿Eliminar este curso? El progreso se conservará si vuelves a instalarlo.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalCancel, { borderColor: colors.border }]}
                onPress={() => setDeleteTarget(null)}
              >
                <Text style={[styles.modalCancelText, { color: colors.text }]}>
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modalDelete, { backgroundColor: "#DC2626" }]}
                onPress={handleDelete}
              >
                <Text style={styles.modalDeleteText}>Eliminar curso</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  },
  card: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: "Geist-SemiBold",
  },
  cardAuthor: {
    fontSize: 14,
    fontFamily: "Geist",
    marginTop: 4,
  },
  cardMeta: {
    fontSize: 13,
    fontFamily: "Geist-Mono",
    marginTop: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Geist-SemiBold",
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 15,
    fontFamily: "Geist",
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 15,
    fontFamily: "Geist-SemiBold",
  },
  modalDelete: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalDeleteText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Geist-SemiBold",
  },
});
