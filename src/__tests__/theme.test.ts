import { resolveTheme } from "../theme/theme";

describe("resolveTheme", () => {
  it("returns system scheme when theme preference is 'system'", () => {
    expect(resolveTheme("light", "system")).toBe("light");
    expect(resolveTheme("dark", "system")).toBe("dark");
  });

  it("returns light when theme preference is 'light', ignoring system", () => {
    expect(resolveTheme("dark", "light")).toBe("light");
  });

  it("returns dark when theme preference is 'dark', ignoring system", () => {
    expect(resolveTheme("light", "dark")).toBe("dark");
  });
});
