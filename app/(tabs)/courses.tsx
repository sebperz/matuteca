import { useEffect, useState, useCallback, useLayoutEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useCourseStore } from "../../src/stores/courseStore";
import { useTheme } from "../../src/theme/theme";
import { getAllCourses, deleteCourse, courseExists } from "../../src/db/courses";
import { parseMarkdown } from "../../src/parser";
import { importOrReplaceCourse } from "../../src/import";
import type { Course } from "../../src/parser";

export default function Courses() {
  const { colors } = useTheme();
  const { courses, setCourses, addCourse, removeCourse } = useCourseStore();
  const router = useRouter();
  const navigation = useNavigation();

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [showReplace, setShowReplace] = useState(false);

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

  const handleImport = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets.length) return;

      const asset = result.assets[0];
      const content = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const course = parseMarkdown(content);
      setPreviewCourse(course);
      setPreviewContent(content);
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("Error al importar", err.message);
      } else {
        Alert.alert("Error", "No se pudo leer el archivo.");
      }
    }
  }, []);

  const doInstall = useCallback(async () => {
    if (!previewContent) return;
    setImporting(true);
    try {
      const { course } = await importOrReplaceCourse(previewContent);
      addCourse(course);
      setPreviewCourse(null);
      setPreviewContent(null);
      setShowReplace(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("Error al instalar", err.message);
      } else {
        Alert.alert("Error", "No se pudo instalar el curso.");
      }
    } finally {
      setImporting(false);
    }
  }, [previewContent, addCourse]);

  const handleInstall = useCallback(async () => {
    if (!previewCourse) return;
    const exists = await courseExists(previewCourse.source_id);
    if (exists) {
      setShowReplace(true);
    } else {
      doInstall();
    }
  }, [previewCourse, doInstall]);

  const closePreview = useCallback(() => {
    setPreviewCourse(null);
    setPreviewContent(null);
    setShowReplace(false);
  }, []);

  useLayoutEffect(() => {
    if (courses.length > 0) {
      navigation.setOptions({
        headerRight: () => (
          <Pressable
            onPress={handleImport}
            hitSlop={8}
            style={styles.headerButton}
          >
            <Ionicons name="add-outline" size={24} color={colors.primary} />
          </Pressable>
        ),
      });
    } else {
      navigation.setOptions({ headerRight: undefined });
    }
  }, [navigation, colors.primary, courses.length, handleImport]);

  const lessonCount = previewCourse
    ? previewCourse.topics.reduce((acc, t) => acc + t.lessons.length, 0)
    : 0;

  if (courses.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No hay cursos instalados
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Importa tu primer archivo .md para comenzar
        </Text>
        <Pressable
          style={[styles.importButton, { backgroundColor: colors.primary }]}
          onPress={handleImport}
        >
          <Ionicons name="add-outline" size={20} color="#FFFFFF" />
          <Text style={styles.importButtonText}>Importar curso</Text>
        </Pressable>

        <Modal
          visible={previewCourse !== null}
          transparent
          animationType="fade"
          onRequestClose={closePreview}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              {importing ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Instalando curso...
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Vista previa
                  </Text>
                  <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.previewTitle, { color: colors.text }]}>
                      {previewCourse?.title}
                    </Text>
                    <Text style={[styles.previewAuthor, { color: colors.textSecondary }]}>
                      {previewCourse?.author}
                    </Text>
                    {previewCourse && (
                      <Text style={[styles.previewMeta, { color: colors.textSecondary }]}>
                        {previewCourse.topics.length} temas · {lessonCount} lecciones
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.modalBody, { color: colors.textSecondary }]}>
                    {previewCourse?.version ? `Versión ${previewCourse.version}` : "Sin versión"}
                  </Text>
                  <View style={styles.modalActions}>
                    <Pressable
                      style={[styles.modalCancel, { borderColor: colors.border }]}
                      onPress={closePreview}
                    >
                      <Text style={[styles.modalCancelText, { color: colors.text }]}>
                        Cancelar
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.modalInstall, { backgroundColor: colors.primary }]}
                      onPress={handleInstall}
                    >
                      <Text style={styles.modalInstallText}>Instalar</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        <Modal
          visible={showReplace}
          transparent
          animationType="fade"
          onRequestClose={() => setShowReplace(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Curso existente
              </Text>
              <Text style={[styles.modalBody, { color: colors.textSecondary }]}>
                Este curso ya está instalado. ¿Reemplazarlo? Tu progreso se conservará.
              </Text>
              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalCancel, { borderColor: colors.border }]}
                  onPress={() => setShowReplace(false)}
                >
                  <Text style={[styles.modalCancelText, { color: colors.text }]}>
                    Cancelar
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.modalInstall, { backgroundColor: colors.primary }]}
                  onPress={doInstall}
                >
                  <Text style={styles.modalInstallText}>Reemplazar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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

      <Modal
        visible={previewCourse !== null}
        transparent
        animationType="fade"
        onRequestClose={closePreview}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            {importing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Instalando curso...
                </Text>
              </View>
            ) : (
              <>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Vista previa
                </Text>
                <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.previewTitle, { color: colors.text }]}>
                    {previewCourse?.title}
                  </Text>
                  <Text style={[styles.previewAuthor, { color: colors.textSecondary }]}>
                    {previewCourse?.author}
                  </Text>
                  {previewCourse && (
                    <Text style={[styles.previewMeta, { color: colors.textSecondary }]}>
                      {previewCourse.topics.length} temas · {lessonCount} lecciones
                    </Text>
                  )}
                </View>
                <Text style={[styles.modalBody, { color: colors.textSecondary }]}>
                  {previewCourse?.version ? `Versión ${previewCourse.version}` : "Sin versión"}
                </Text>
                <View style={styles.modalActions}>
                  <Pressable
                    style={[styles.modalCancel, { borderColor: colors.border }]}
                    onPress={closePreview}
                  >
                    <Text style={[styles.modalCancelText, { color: colors.text }]}>
                      Cancelar
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalInstall, { backgroundColor: colors.primary }]}
                    onPress={handleInstall}
                  >
                    <Text style={styles.modalInstallText}>Instalar</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showReplace}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReplace(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Curso existente
            </Text>
            <Text style={[styles.modalBody, { color: colors.textSecondary }]}>
              Este curso ya está instalado. ¿Reemplazarlo? Tu progreso se conservará.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalCancel, { borderColor: colors.border }]}
                onPress={() => setShowReplace(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.text }]}>
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modalInstall, { backgroundColor: colors.primary }]}
                onPress={doInstall}
              >
                <Text style={styles.modalInstallText}>Reemplazar</Text>
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
  modalInstall: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalInstallText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Geist-SemiBold",
  },
  headerButton: {
    marginRight: 4,
    padding: 8,
  },
  importButton: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  importButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Geist-SemiBold",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    fontFamily: "Geist",
  },
  previewCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 8,
  },
  previewTitle: {
    fontSize: 17,
    fontFamily: "Geist-SemiBold",
    marginBottom: 4,
  },
  previewAuthor: {
    fontSize: 14,
    fontFamily: "Geist",
  },
  previewMeta: {
    fontSize: 13,
    fontFamily: "Geist-Mono",
    marginTop: 8,
  },
});
