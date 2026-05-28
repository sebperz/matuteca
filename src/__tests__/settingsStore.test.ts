import { useSettingsStore } from "../stores/settingsStore";

describe("useSettingsStore", () => {
  beforeEach(() => {
    useSettingsStore.setState({ theme: "system", isLoading: false });
  });

  it("returns default settings and is not loading", () => {
    const state = useSettingsStore.getState();

    expect(state.theme).toBe("system");
    expect(state.isLoading).toBe(false);
  });

  it("setTheme updates the stored theme", () => {
    useSettingsStore.getState().setTheme("dark");
    expect(useSettingsStore.getState().theme).toBe("dark");
  });
});
