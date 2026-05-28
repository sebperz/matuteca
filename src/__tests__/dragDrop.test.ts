import {
  createDragDropState,
  type DragDropState,
} from "../lesson/dragDropState";

const SCREEN = {
  type: "drag-drop" as const,
  title: "Drag",
  reusable: false,
  text: "The [___] is a gas.",
  question: "Fill in",
  pool: ["Helium", "Oxygen", "Carbon"],
  blanks: [
    { id: 1, answer: "Helium" },
  ],
  explanation: "Helium is a noble gas.",
};

describe("dragDropState", () => {
  it("starts in idle state with empty blanks and shuffled pool", () => {
    const state = createDragDropState(SCREEN);

    expect(state.flowState).toBe("idle");
    expect(Object.keys(state.blanks).length).toBe(0);
    expect(state.poolItems).toHaveLength(3);
    expect(state.canSubmit).toBe(false);
  });

  it("places an item in a blank", () => {
    let state = createDragDropState(SCREEN);
    const item = state.poolItems[0];

    state = state.placeItem(1, item.id);

    expect(state.blanks[1]).toBe(item.id);
    expect(state.blanks[1]).toBe(item.id);
  });

  it("enables submit only when all blanks are filled", () => {
    let state = createDragDropState(SCREEN);
    const item = state.poolItems[0];

    state = state.placeItem(1, item.id);
    expect(state.canSubmit).toBe(true);
  });

  it("does not allow placing when flowState is not idle", () => {
    let state = createDragDropState(SCREEN);
    const item = state.poolItems[0];

    state = state.placeItem(1, item.id);
    state = state.submit();

    const item2 = state.poolItems[1];
    const result = state.placeItem(1, item2.id);
    expect(result.blanks[1]).toBe(item.id);
  });

  it("returns item to pool on remove", () => {
    let state = createDragDropState(SCREEN);
    const item = state.poolItems[0];

    state = state.placeItem(1, item.id);
    state = state.removeFromBlank(1);

    expect(state.blanks[1]).toBeUndefined();
  });

  it("replaces item in blank: old item returns to pool", () => {
    const multiScreen = {
      ...SCREEN,
      reusable: false,
      blanks: [
        { id: 1, answer: "Helium" },
        { id: 2, answer: "Oxygen" },
      ],
    };
    let state = createDragDropState(multiScreen);

    const itemA = state.poolItems[0];
    const itemB = state.poolItems[1];

    state = state.placeItem(1, itemA.id);
    state = state.placeItem(1, itemB.id);

    expect(state.blanks[1]).toBe(itemB.id);
  });

  it("marks reusable items as still available after placement", () => {
    const reusableScreen = {
      ...SCREEN,
      reusable: true,
      blanks: [
        { id: 1, answer: "Helium" },
        { id: 2, answer: "Helium" },
      ],
    };
    let state = createDragDropState(reusableScreen);
    const heliumItem = state.poolItems.find(
      (p) => p.label === "Helium",
    )!;

    state = state.placeItem(1, heliumItem.id);
    state = state.placeItem(2, heliumItem.id);

    expect(state.blanks[1]).toBe(heliumItem.id);
    expect(state.blanks[2]).toBe(heliumItem.id);
  });

  it("transitions to correct on right answer", () => {
    let state = createDragDropState(SCREEN);
    const heliumItem = state.poolItems.find(
      (p) => p.label === "Helium",
    )!;

    state = state.placeItem(1, heliumItem.id);
    state = state.submit();

    expect(state.flowState).toBe("correct");
  });

  it("transitions to incorrect on wrong answer", () => {
    let state = createDragDropState(SCREEN);
    const wrongItem = state.poolItems.find(
      (p) => p.label !== "Helium",
    )!;

    state = state.placeItem(1, wrongItem.id);
    state = state.submit();

    expect(state.flowState).toBe("incorrect");
  });

  it("reset clears all blanks and returns to idle", () => {
    let state = createDragDropState(SCREEN);
    const item = state.poolItems[0];

    state = state.placeItem(1, item.id);
    state = state.submit();
    state = state.reset();

    expect(state.flowState).toBe("idle");
    expect(Object.keys(state.blanks).length).toBe(0);
  });
});
