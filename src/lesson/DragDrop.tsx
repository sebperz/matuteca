import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useState } from "react";
import { TextScreenRenderer } from "./TextScreenRenderer";
import { useTheme } from "../theme/theme";
import {
  createDragDropState,
  type DragDropState,
  type PoolItem,
} from "./dragDropState";
import type { DragDropScreen } from "../parser/types";

interface Props {
  screen: DragDropScreen;
  onContinue: () => void;
}

export function DragDrop({ screen, onContinue }: Props) {
  const { colors } = useTheme();
  const [state, setState] = useState<DragDropState>(() =>
    createDragDropState(screen),
  );
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const { flowState, blanks, poolItems, canSubmit } = state;
  const { reusable, text, blanks: blankDefs, pool, explanation } = screen;

  const isDisabled = flowState !== "idle";
  const isRevealing = flowState === "revealed" || flowState === "explanation";

  const handlePlaceItem = (blankId: number) => {
    if (!selectedItemId) return;
    setState((s) => {
      const next = s.placeItem(blankId, selectedItemId);
      return next;
    });
    setSelectedItemId(null);
  };

  const handleSelectPoolItem = (itemId: string) => {
    if (isDisabled) return;

    const usedInBlank = Object.values(blanks).includes(itemId);
    if (!reusable && usedInBlank) return;

    setSelectedItemId(selectedItemId === itemId ? null : itemId);
  };

  const handleSubmit = () => setState((s) => s.submit());
  const handleReset = () => {
    setState((s) => s.reset());
    setSelectedItemId(null);
  };
  const handleShowExplanation = () => {
    setState((s) => s.showExplanation());
    setShowExplanation(true);
  };
  const handleShowCorrect = () => setState((s) => s.showCorrectAnswer());
  const handleContinue = () => onContinue();

  const renderText = () => {
    const parts = text.split("[___]");
    return parts.map((part, i) => {
      const blankDef = blankDefs[i];
      const placedId = blankDef ? blanks[blankDef.id] : undefined;
      const placedItem = placedId
        ? poolItems.find((p) => p.id === placedId)
        : null;

      let blankBg = "transparent";
      let blankBorder = colors.border;
      let blankText = placedItem?.label ?? `[___]`;

      if (placedItem) {
        blankBorder = colors.primary;
      }

      return (
        <Text key={i}>
          <Text style={[styles.textContent, { color: colors.text }]}>
            {part}
          </Text>
          {blankDef && (
            <Pressable
              onPress={() => handlePlaceItem(blankDef.id)}
              disabled={isDisabled}
              accessibilityLabel={`espacio ${blankDef.id} de ${blankDefs.length}, ${placedItem ? `rellenado con ${placedItem.label}` : "vacío"}`}
            >
              <Text
                style={[
                  styles.blank,
                  {
                    borderColor: blankBorder,
                    backgroundColor: blankBg,
                    color: colors.text,
                  },
                ]}
              >
                {blankText}
              </Text>
            </Pressable>
          )}
        </Text>
      );
    });
  };

  const getItemAvailability = (item: PoolItem) => {
    if (isDisabled) return false;
    if (reusable) return true;
    return !Object.values(blanks).includes(item.id);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        Completa los espacios
      </Text>

      <View style={styles.textArea}>{renderText()}</View>

      <View style={styles.pool}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Opciones
        </Text>
        <View style={styles.poolItems}>
          {poolItems.map((item) => {
            const available = getItemAvailability(item);
            const isUsed = Object.values(blanks).includes(item.id);
            const isSelected = selectedItemId === item.id;

            return (
              <Pressable
                key={item.id}
                style={[
                  styles.poolChip,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    opacity: !reusable && isUsed ? 0.3 : 1,
                  },
                ]}
                onPress={() => handleSelectPoolItem(item.id)}
                disabled={!available}
                accessibilityLabel={`${item.label}, arrastrable`}
              >
                <Text
                  style={[
                    styles.poolChipText,
                    {
                      color: isSelected ? "#FFFFFF" : colors.text,
                      fontFamily: "Geist-Mono",
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.actions}>
        {flowState === "idle" && (
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.iconButton, { borderColor: colors.border }]}
              onPress={handleReset}
            >
              <Text style={[styles.iconButtonText, { color: colors.text }]}>
                ⟳
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.submitButton,
                { backgroundColor: canSubmit ? colors.primary : colors.border },
              ]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              <Text style={styles.submitText}>Enviar</Text>
            </Pressable>
          </View>
        )}

        {flowState === "correct" && (
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.outlineButton, { borderColor: colors.primary }]}
              onPress={handleShowExplanation}
            >
              <Text style={[styles.outlineText, { color: colors.primary }]}>
                Ver explicación
              </Text>
            </Pressable>
            <Pressable
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleContinue}
            >
              <Text style={styles.submitText}>Continuar</Text>
            </Pressable>
          </View>
        )}

        {flowState === "incorrect" && (
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.outlineButton, { borderColor: colors.muted }]}
              onPress={handleShowCorrect}
            >
              <Text style={[styles.outlineText, { color: colors.text }]}>
                Ver respuesta
              </Text>
            </Pressable>
            <Pressable
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleReset}
            >
              <Text style={styles.submitText}>Reintentar</Text>
            </Pressable>
          </View>
        )}

        {flowState === "revealed" && (
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.outlineButton, { borderColor: colors.primary }]}
              onPress={handleShowExplanation}
            >
              <Text style={[styles.outlineText, { color: colors.primary }]}>
                Explicación
              </Text>
            </Pressable>
            <Pressable
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleContinue}
            >
              <Text style={styles.submitText}>Continuar</Text>
            </Pressable>
          </View>
        )}
      </View>

      <Modal
        visible={showExplanation}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExplanation(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Explicación
            </Text>
            <TextScreenRenderer
              nodes={[{ type: "text", text: explanation }]}
            />
            <Pressable
              style={[
                styles.submitButton,
                {
                  backgroundColor: colors.primary,
                  marginTop: 24,
                  alignSelf: "center",
                },
              ]}
              onPress={() => {
                setShowExplanation(false);
                handleContinue();
              }}
            >
              <Text style={styles.submitText}>Continuar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Geist-SemiBold",
    marginBottom: 12,
  },
  textArea: {
    marginBottom: 24,
  },
  textContent: {
    fontSize: 16,
    fontFamily: "Geist",
    lineHeight: 28,
  },
  blank: {
    fontSize: 16,
    fontFamily: "Geist-Mono",
    borderWidth: 2,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 44,
    minHeight: 44,
    textAlign: "center",
  },
  pool: {
    marginBottom: 24,
  },
  poolItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  poolChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  poolChipText: {
    fontSize: 15,
    fontFamily: "Geist-Mono",
  },
  actions: {
    marginTop: 8,
    alignItems: "center",
  },
  submitButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 160,
    alignItems: "center",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Geist-SemiBold",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  outlineButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
  },
  outlineText: {
    fontSize: 16,
    fontFamily: "Geist-SemiBold",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonText: {
    fontSize: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Geist-Bold",
    marginBottom: 16,
  },
});
