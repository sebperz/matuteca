export type FlowState =
  | "idle"
  | "correct"
  | "incorrect"
  | "revealed"
  | "explanation";

export interface MultipleChoiceState {
  flowState: FlowState;
  selected: Set<number>;
  canSubmit: boolean;
  select: (index: number) => MultipleChoiceState;
  submit: () => MultipleChoiceState;
  reset: () => MultipleChoiceState;
  showExplanation: () => MultipleChoiceState;
  showCorrectAnswer: () => MultipleChoiceState;
}

interface ScreenData {
  multiple: boolean;
  options: string[];
  correct: number[];
}

function isCorrect(
  screen: ScreenData,
  selected: Set<number>,
): boolean {
  const correctSet = new Set(screen.correct);
  if (screen.multiple) {
    return (
      selected.size === correctSet.size &&
      [...selected].every((i) => correctSet.has(i))
    );
  }
  return selected.size === 1 && correctSet.has([...selected][0]);
}

export function createMultipleChoiceState(
  screen: ScreenData,
): MultipleChoiceState {
  return makeState(screen, "idle", new Set<number>());
}

function makeState(
  screen: ScreenData,
  flowState: FlowState,
  selected: Set<number>,
): MultipleChoiceState {
  const canSubmit =
    flowState === "idle" && selected.size > 0;

  return {
    flowState,
    selected,
    canSubmit,

    select(index: number): MultipleChoiceState {
      if (flowState !== "idle") return this;
      const next = new Set(selected);
      if (next.has(index)) {
        next.delete(index);
      } else {
        if (!screen.multiple) {
          next.clear();
        }
        next.add(index);
      }
      return makeState(screen, "idle", next);
    },

    submit(): MultipleChoiceState {
      if (flowState !== "idle" || selected.size === 0) return this;
      return makeState(
        screen,
        isCorrect(screen, selected) ? "correct" : "incorrect",
        selected,
      );
    },

    reset(): MultipleChoiceState {
      return makeState(screen, "idle", new Set());
    },

    showExplanation(): MultipleChoiceState {
      if (flowState === "correct" || flowState === "revealed") {
        return makeState(screen, "explanation", selected);
      }
      return this;
    },

    showCorrectAnswer(): MultipleChoiceState {
      if (flowState === "incorrect") {
        return makeState(screen, "revealed", selected);
      }
      return this;
    },
  };
}
