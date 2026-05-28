import { parseInline, ParseError } from "../parser/inline";
import type { InlineNode } from "../parser/types";

describe("parseInline", () => {
  it("returns a plain text node for content without formatting", () => {
    expect(parseInline("Hello world")).toEqual([
      { type: "text", text: "Hello world" },
    ]);
  });

  it("parses bold with ** markers", () => {
    expect(parseInline("Hello **world**!")).toEqual([
      { type: "text", text: "Hello " },
      { type: "bold", content: [{ type: "text", text: "world" }] },
      { type: "text", text: "!" },
    ]);
  });

  it("parses bold with __ markers", () => {
    expect(parseInline("Hello __world__!")).toEqual([
      { type: "text", text: "Hello " },
      { type: "bold", content: [{ type: "text", text: "world" }] },
      { type: "text", text: "!" },
    ]);
  });

  it("parses italic with * markers", () => {
    expect(parseInline("Hello *world*!")).toEqual([
      { type: "text", text: "Hello " },
      { type: "italic", content: [{ type: "text", text: "world" }] },
      { type: "text", text: "!" },
    ]);
  });

  it("parses italic with _ markers", () => {
    expect(parseInline("Hello _world_!")).toEqual([
      { type: "text", text: "Hello " },
      { type: "italic", content: [{ type: "text", text: "world" }] },
      { type: "text", text: "!" },
    ]);
  });

  it("parses code with backtick markers", () => {
    expect(parseInline("Use `print()` function.")).toEqual([
      { type: "text", text: "Use " },
      { type: "code", text: "print()" },
      { type: "text", text: " function." },
    ]);
  });

  it("parses nested bold inside italic", () => {
    expect(parseInline("Hello *world **nested** text*!")).toEqual([
      { type: "text", text: "Hello " },
      {
        type: "italic",
        content: [
          { type: "text", text: "world " },
          { type: "bold", content: [{ type: "text", text: "nested" }] },
          { type: "text", text: " text" },
        ],
      },
      { type: "text", text: "!" },
    ]);
  });

  it("does not parse bold inside code", () => {
    expect(parseInline("`code **not bold** here`")).toEqual([
      { type: "code", text: "code **not bold** here" },
    ]);
  });

  it("handles escaped asterisks", () => {
    expect(parseInline("Not \\*italic\\* here")).toEqual([
      { type: "text", text: "Not *italic* here" },
    ]);
  });
});
