import { useProgressStore } from "../stores/progressStore";

describe("useProgressStore", () => {
  it("returns an empty progress map and is not loading by default", () => {
    const state = useProgressStore.getState();

    expect(state.progress).toEqual({});
    expect(state.isLoading).toBe(false);
  });
});
