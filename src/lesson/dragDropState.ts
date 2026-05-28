export type FlowState =
  | "idle"
  | "correct"
  | "incorrect"
  | "revealed"
  | "explanation";

export interface PoolItem {
  id: string;
  label: string;
}

export interface DragDropState {
  flowState: FlowState;
  blanks: Record<number, string>;
  poolItems: PoolItem[];
  canSubmit: boolean;
  placeItem: (blankId: number, poolItemId: string) => DragDropState;
  removeFromBlank: (blankId: number) => DragDropState;
  submit: () => DragDropState;
  reset: () => DragDropState;
  showExplanation: () => DragDropState;
  showCorrectAnswer: () => DragDropState;
}

interface ScreenData {
  reusable: boolean;
  pool: string[];
  blanks: { id: number; answer: string }[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createPoolItems(pool: string[]): PoolItem[] {
  const shuffled = shuffle(pool.map((label, i) => `${label}-${i}`));
  return pool.map((label, i) => ({
    id: shuffled[i],
    label,
  }));
}

function isCorrect(
  screen: ScreenData,
  blanks: Record<number, string>,
  poolItems: PoolItem[],
): boolean {
  for (const blank of screen.blanks) {
    const placedId = blanks[blank.id];
    if (!placedId) return false;
    const placedItem = poolItems.find((p) => p.id === placedId);
    if (!placedItem || placedItem.label !== blank.answer) return false;
  }
  return true;
}

export function createDragDropState(
  screen: ScreenData,
): DragDropState {
  return makeState(screen, "idle", {}, createPoolItems(screen.pool));
}

function makeState(
  screen: ScreenData,
  flowState: FlowState,
  blanks: Record<number, string>,
  poolItems: PoolItem[],
): DragDropState {
  const allFilled = screen.blanks.every((b) => blanks[b.id] != null);
  const canSubmit = flowState === "idle" && allFilled;

  return {
    flowState,
    blanks,
    poolItems,
    canSubmit,

    placeItem(blankId: number, poolItemId: string): DragDropState {
      if (flowState !== "idle") return this;

      const item = poolItems.find((p) => p.id === poolItemId);
      if (!item) return this;

      if (!screen.reusable) {
        const usedInBlank = Object.entries(blanks).find(
          ([, v]) => v === poolItemId,
        );
        if (usedInBlank && parseInt(usedInBlank[0]) !== blankId) {
          return this;
        }
      }

      const oldItemId = blanks[blankId];
      const nextBlanks = { ...blanks, [blankId]: poolItemId };

      return makeState(screen, flowState, nextBlanks, poolItems);
    },

    removeFromBlank(blankId: number): DragDropState {
      if (flowState !== "idle") return this;

      if (!blanks[blankId]) return this;

      const nextBlanks = { ...blanks };
      delete nextBlanks[blankId];

      return makeState(screen, flowState, nextBlanks, poolItems);
    },

    submit(): DragDropState {
      if (flowState !== "idle" || !allFilled) return this;
      return makeState(
        screen,
        isCorrect(screen, blanks, poolItems) ? "correct" : "incorrect",
        blanks,
        poolItems,
      );
    },

    reset(): DragDropState {
      return makeState(screen, "idle", {}, createPoolItems(screen.pool));
    },

    showExplanation(): DragDropState {
      if (flowState === "correct" || flowState === "revealed") {
        return makeState(screen, "explanation", blanks, poolItems);
      }
      return this;
    },

    showCorrectAnswer(): DragDropState {
      if (flowState === "incorrect") {
        return makeState(screen, "revealed", blanks, poolItems);
      }
      return this;
    },
  };
}
