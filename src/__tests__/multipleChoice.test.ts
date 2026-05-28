import {
  createMultipleChoiceState,
  type MultipleChoiceState,
} from "../lesson/multipleChoiceState";

const SCREEN = {
  type: "multiple-choice" as const,
  title: "Quiz",
  multiple: false,
  question: "What is 1+1?",
  options: ["1", "2", "3", "4"],
  correct: [1],
  explanation: "Basic arithmetic.",
};

describe("multipleChoiceState", () => {
  it("starts in idle state with empty selection", () => {
    const state = createMultipleChoiceState(SCREEN);

    expect(state.flowState).toBe("idle");
    expect(state.selected).toEqual(new Set());
    expect(state.canSubmit).toBe(false);
  });

  it("toggles single selection", () => {
    let state = createMultipleChoiceState(SCREEN);

    state = state.select(1);
    expect(state.selected).toEqual(new Set([1]));
    expect(state.canSubmit).toBe(true);

    state = state.select(1);
    expect(state.selected).toEqual(new Set());
    expect(state.canSubmit).toBe(false);
  });

  it("supports multiple selection when multiple is true", () => {
    const multiScreen = { ...SCREEN, multiple: true, correct: [0, 2] };
    let state = createMultipleChoiceState(multiScreen);

    state = state.select(0);
    state = state.select(2);
    expect(state.selected).toEqual(new Set([0, 2]));
  });

  it("transitions to correct state on right answer", () => {
    let state = createMultipleChoiceState(SCREEN);
    state = state.select(1);

    state = state.submit();
    expect(state.flowState).toBe("correct");
    expect(state.selected).toEqual(new Set([1]));
  });

  it("transitions to incorrect state on wrong answer", () => {
    let state = createMultipleChoiceState(SCREEN);
    state = state.select(0);

    state = state.submit();
    expect(state.flowState).toBe("incorrect");
  });

  it("reset clears selection and returns to idle", () => {
    let state = createMultipleChoiceState(SCREEN);
    state = state.select(1);
    state = state.submit();

    state = state.reset();
    expect(state.flowState).toBe("idle");
    expect(state.selected).toEqual(new Set());
  });

  it("transitions from correct to explanation", () => {
    let state = createMultipleChoiceState(SCREEN);
    state = state.select(1);
    state = state.submit();

    state = state.showExplanation();
    expect(state.flowState).toBe("explanation");
  });

  it("transitions from incorrect to revealed to explanation", () => {
    let state = createMultipleChoiceState(SCREEN);
    state = state.select(0);
    state = state.submit();

    state = state.showCorrectAnswer();
    expect(state.flowState).toBe("revealed");

    state = state.showExplanation();
    expect(state.flowState).toBe("explanation");
  });
});
