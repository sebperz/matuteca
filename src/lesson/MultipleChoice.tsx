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
  createMultipleChoiceState,
  type MultipleChoiceState,
} from "./multipleChoiceState";
import type { MultipleChoiceScreen } from "../parser/types";

interface Props {
  screen: MultipleChoiceScreen;
  onContinue: () => void;
}

export function MultipleChoice({ screen, onContinue }: Props) {
  const { colors } = useTheme();
  const [state, setState] = useState<MultipleChoiceState>(() =>
    createMultipleChoiceState(screen),
  );
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSelect = (index: number) => {
    setState((s) => s.select(index));
  };

  const handleSubmit = () => {
    setState((s) => s.submit());
  };

  const handleReset = () => {
    setState((s) => s.reset());
  };

  const handleShowExplanation = () => {
    setState((s) => s.showExplanation());
    setShowExplanation(true);
  };

  const handleShowCorrect = () => {
    setState((s) => s.showCorrectAnswer());
  };

  const handleContinue = () => {
    onContinue();
  };

  const { flowState, selected, canSubmit } = state;
  const {
    multiple,
    options,
    correct,
    question,
    explanation,
  } = screen;

  const isRevealing = flowState === "revealed" || flowState === "explanation";
  const isDisabled = flowState !== "idle";

  return (
    <View style={styles.container}>
      <Text style={[styles.question, { color: colors.text }]}>
        {question}
      </Text>

      {options.map((option, i) => {
        const isSelected = selected.has(i);
        const isCorrectOption = correct.includes(i);
        const isWrongSelection = isSelected && !isCorrectOption;

        let optionColor = colors.border;
        let optionBg = colors.surface;

        if (flowState === "correct" && isSelected && isCorrectOption) {
          optionColor = colors.success;
        }
        if (flowState === "incorrect" && isSelected && !isCorrectOption) {
          optionColor = colors.muted;
        }
        if (isRevealing && isCorrectOption) {
          optionColor = colors.success;
        }
        if (isRevealing && isWrongSelection) {
          optionColor = colors.muted;
        }

        return (
          <View key={i}>
            {i > 0 && (
              <View
                style={[styles.separator, { backgroundColor: colors.border }]}
              />
            )}
            <Pressable
              style={[styles.option, { opacity: isDisabled && !isSelected ? 0.4 : 1 }]}
              onPress={() => handleSelect(i)}
              disabled={isDisabled}
              accessibilityLabel={`opción ${i + 1} de ${options.length}: ${option}`}
            >
              <View
                style={[
                  styles.radio,
                  { borderColor: optionColor, backgroundColor: optionBg },
                  isSelected && { borderColor: optionColor },
                ]}
              >
                {(isSelected || (isRevealing && isCorrectOption)) && (
                  <View
                    style={[
                      styles.radioFill,
                      { backgroundColor: optionColor },
                    ]}
                  />
                )}
              </View>
              <Text style={[styles.optionText, { color: colors.text }]}>
                {option}
              </Text>
            </Pressable>
          </View>
        );
      })}

      <View style={styles.actions}>
        {flowState === "idle" && (
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
  question: {
    fontSize: 17,
    fontFamily: "Geist-SemiBold",
    marginBottom: 24,
  },
  separator: {
    height: 1,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  radioFill: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionText: {
    fontSize: 16,
    fontFamily: "Geist",
    flex: 1,
  },
  actions: {
    marginTop: 32,
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
