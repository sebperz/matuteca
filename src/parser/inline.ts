import { InlineNode } from "./types";

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

interface CodeBlock {
  content: string;
}

function replaceCodeBlocks(input: string): { text: string; codes: string[] } {
  const codes: string[] = [];
  let result = "";
  let i = 0;

  while (i < input.length) {
    if (input[i] === "`") {
      i++;
      let code = "";
      while (i < input.length && input[i] !== "`") {
        code += input[i];
        i++;
      }
      if (i < input.length) {
        i++;
        codes.push(code);
        result += `\0${codes.length - 1}\0`;
      } else {
        result += "`" + code;
      }
    } else {
      result += input[i];
      i++;
    }
  }

  return { text: result, codes };
}

export function parseInline(input: string): InlineNode[] {
  if (!input) return [];

  const { text, codes } = replaceCodeBlocks(input);

  const nodes: InlineNode[] = [];
  type StackEntry = { type: "bold" | "italic"; children: InlineNode[] };
  const stack: StackEntry[] = [];
  let currentText = "";

  function flushText() {
    if (!currentText) return;
    const target = stack.length > 0 ? stack[stack.length - 1].children : nodes;
    target.push({ type: "text", text: currentText });
    currentText = "";
  }

  function pushCode(codeIdx: number) {
    flushText();
    const target = stack.length > 0 ? stack[stack.length - 1].children : nodes;
    target.push({ type: "code", text: codes[codeIdx] });
  }

  let i = 0;
  while (i < text.length) {
    if (text[i] === "\\" && i + 1 < text.length) {
      currentText += text[i + 1];
      i += 2;
      continue;
    }

    if (text[i] === "\0") {
      flushText();
      i++;
      let numStr = "";
      while (i < text.length && text[i] >= "0" && text[i] <= "9") {
        numStr += text[i];
        i++;
      }
      i++; // skip closing \0
      pushCode(parseInt(numStr, 10));
      continue;
    }

    if (text[i] === "*") {
      if (text[i + 1] === "*") {
        flushText();
        const last = stack[stack.length - 1];
        if (last && last.type === "bold") {
          stack.pop();
          const parent = stack.length > 0 ? stack[stack.length - 1].children : nodes;
          parent.push({ type: "bold", content: last.children });
        } else {
          stack.push({ type: "bold", children: [] });
        }
        i += 2;
        continue;
      } else {
        flushText();
        const last = stack[stack.length - 1];
        if (last && last.type === "italic") {
          stack.pop();
          const parent = stack.length > 0 ? stack[stack.length - 1].children : nodes;
          parent.push({ type: "italic", content: last.children });
        } else {
          stack.push({ type: "italic", children: [] });
        }
        i += 1;
        continue;
      }
    }

    if (text[i] === "_") {
      if (text[i + 1] === "_") {
        flushText();
        const last = stack[stack.length - 1];
        if (last && last.type === "bold") {
          stack.pop();
          const parent = stack.length > 0 ? stack[stack.length - 1].children : nodes;
          parent.push({ type: "bold", content: last.children });
        } else {
          stack.push({ type: "bold", children: [] });
        }
        i += 2;
        continue;
      } else {
        flushText();
        const last = stack[stack.length - 1];
        if (last && last.type === "italic") {
          stack.pop();
          const parent = stack.length > 0 ? stack[stack.length - 1].children : nodes;
          parent.push({ type: "italic", content: last.children });
        } else {
          stack.push({ type: "italic", children: [] });
        }
        i += 1;
        continue;
      }
    }

    currentText += text[i];
    i++;
  }

  flushText();
  return nodes;
}
