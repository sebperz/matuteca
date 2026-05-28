import { parseMarkdown, Course } from "../parser";

const VALID_MINIMAL = `---
source_id: test-1
title: Test Course
author: Test Author
---

# Tema: Test Topic

## Lección: Test Lesson

### Pantalla: Test Screen

Hello world.
`;

describe("parseMarkdown", () => {
  it("parses a minimal valid course with one topic, lesson and text screen", () => {
    const course = parseMarkdown(VALID_MINIMAL);

    expect(course.source_id).toBe("test-1");
    expect(course.title).toBe("Test Course");
    expect(course.author).toBe("Test Author");
    expect(course.version).toBe("1.0.0");
    expect(course.topics).toHaveLength(1);

    const topic = course.topics[0];
    expect(topic.title).toBe("Test Topic");
    expect(topic.lessons).toHaveLength(1);

    const lesson = topic.lessons[0];
    expect(lesson.title).toBe("Test Lesson");
    expect(lesson.screens).toHaveLength(1);

    const screen = lesson.screens[0];
    expect(screen.type).toBe("text");
    expect(screen.title).toBe("Test Screen");
    if (screen.type === "text") {
      expect(screen.nodes).toEqual([{ type: "text", text: "Hello world." }]);
    }
  });

  it("rejects missing source_id in frontmatter", () => {
    const input = `---
title: Test Course
author: Test Author
---

# Tema: Test Topic

## Lección: Test Lesson

### Pantalla: Test Screen

Hello world.
`;

    expect(() => parseMarkdown(input)).toThrow(
      "[line 1] source_id is required in frontmatter",
    );
  });

  it("rejects missing title in frontmatter", () => {
    const input = `---
source_id: test-1
author: Test Author
---

# Tema: Test Topic

## Lección: Test Lesson

### Pantalla: Test Screen

Hello world.
`;

    expect(() => parseMarkdown(input)).toThrow(
      "[line 1] title is required in frontmatter",
    );
  });

  it("rejects missing author in frontmatter", () => {
    const input = `---
source_id: test-1
title: Test Course
---

# Tema: Test Topic

## Lección: Test Lesson

### Pantalla: Test Screen

Hello world.
`;

    expect(() => parseMarkdown(input)).toThrow(
      "[line 1] author is required in frontmatter",
    );
  });

  it("rejects unknown screen type", () => {
    const input = `---
source_id: test-1
title: Test Course
author: Test Author
---

# Tema: Test Topic

## Lección: Test Lesson

### Pantalla: Test Screen

---

type: invalid-type

---
`;

    expect(() => parseMarkdown(input)).toThrow(
      'unknown screen type "invalid-type". Valid types: text, multiple-choice, drag-drop, end',
    );
  });

  it("rejects missing question in multiple-choice activity", () => {
    const input = `---
source_id: test-1
title: Test Course
author: Test Author
---

# Tema: Test Topic

## Lección: Test Lesson

### Pantalla: Test Screen

---

type: multiple-choice
multiple: false
options:
  - a
  - b
correct: [0]
explanation: Why.
---

`;

    expect(() => parseMarkdown(input)).toThrow(
      "question is required for type multiple-choice",
    );
  });

  it("rejects missing explanation in multiple-choice activity", () => {
    const input = `---
source_id: test-1
title: Test Course
author: Test Author
---

# Tema: Test Topic

## Lección: Test Lesson

### Pantalla: Test Screen

---

type: multiple-choice
multiple: false
question: "What?"
options:
  - a
  - b
correct: [0]
---

`;

    expect(() => parseMarkdown(input)).toThrow(
      "explanation is required for type multiple-choice",
    );
  });

  it("rejects correct index out of range", () => {
    const input = `---
source_id: test-1
title: Test Course
author: Test Author
---

# Tema: Test Topic

## Lección: Test Lesson

### Pantalla: Test Screen

---

type: multiple-choice
multiple: false
question: "What?"
options:
  - a
  - b
correct: [5]
explanation: Why.
---

`;

    expect(() => parseMarkdown(input)).toThrow(
      "correct index 5 out of range (options has 2 items)",
    );
  });

  it("rejects correct with more than 1 index when multiple is false", () => {
    const input = `---
source_id: test-1
title: Test Course
author: Test Author
---

# Tema: Test Topic

## Lección: Test Lesson

### Pantalla: Test Screen

---

type: multiple-choice
multiple: false
question: "What?"
options:
  - a
  - b
correct: [0, 1]
explanation: Why.
---

`;

    expect(() => parseMarkdown(input)).toThrow(
      "correct must have exactly 1 index when multiple is false",
    );
  });

  it("rejects options with fewer than 2 items", () => {
    const input = `---
source_id: test-1
title: Test Course
author: Test Author
---

# Tema: Test Topic

## Lección: Test Lesson

### Pantalla: Test Screen

---

type: multiple-choice
multiple: false
question: "What?"
options:
  - a
correct: [0]
explanation: Why.
---

`;

    expect(() => parseMarkdown(input)).toThrow(
      "options must have at least 2 items",
    );
  });

  it("rejects blank answer not in pool for drag-drop", () => {
    const input = `---
source_id: test-1
title: Test Course
author: Test Author
---

# Tema: Test Topic

## Lección: Test Lesson

### Pantalla: Test Screen

---

type: drag-drop
reusable: false
text: "[___]"
question: "Fill in"
pool:
  - helio
blanks:
  - id: 1
    answer: bogota
explanation: Why.
---
`;

    expect(() => parseMarkdown(input)).toThrow(
      'blank 1 answer "bogota" not found in pool',
    );
  });

  it("rejects empty pool in drag-drop", () => {
    const input = `---
source_id: test-1
title: Test Course
author: Test Author
---

# Tema: Test Topic

## Lección: Test Lesson

### Pantalla: Test Screen

---

type: drag-drop
reusable: false
text: "[___]"
question: "Fill in"
pool: []
blanks:
  - id: 1
    answer: helio
explanation: Why.
---
`;

    expect(() => parseMarkdown(input)).toThrow(
      "pool must have at least 1 item",
    );
  });

  it("rejects duplicate blank id in drag-drop", () => {
    const input = `---
source_id: test-1
title: Test Course
author: Test Author
---

# Tema: Test Topic

## Lección: Test Lesson

### Pantalla: Test Screen

---

type: drag-drop
reusable: false
text: "[___] [___]"
question: "Fill in"
pool:
  - helio
  - carbono
blanks:
  - id: 1
    answer: helio
  - id: 1
    answer: carbono
explanation: Why.
---
`;

    expect(() => parseMarkdown(input)).toThrow(
      "duplicate blank id 1",
    );
  });

  it("rejects blanks count not matching placeholders in drag-drop", () => {
    const input = `---
source_id: test-1
title: Test Course
author: Test Author
---

# Tema: Test Topic

## Lección: Test Lesson

### Pantalla: Test Screen

---

type: drag-drop
reusable: false
text: "[___]"
question: "Fill in"
pool:
  - helio
  - carbono
blanks:
  - id: 1
    answer: helio
  - id: 2
    answer: carbono
explanation: Why.
---
`;

    expect(() => parseMarkdown(input)).toThrow(
      "2 blanks defined but text has 1 [___] placeholders",
    );
  });

  it("rejects lesson without parent topic", () => {
    const input = `---
source_id: test-1
title: Test Course
author: Test Author
---

## Lección: Orphan Lesson

### Pantalla: Test Screen

Hello.
`;

    expect(() => parseMarkdown(input)).toThrow(
      'lesson "Orphan Lesson" has no parent topic',
    );
  });

  it("rejects screen without parent lesson", () => {
    const input = `---
source_id: test-1
title: Test Course
author: Test Author
---

### Pantalla: Orphan Screen

Hello.
`;

    expect(() => parseMarkdown(input)).toThrow(
      'screen "Orphan Screen" has no parent lesson',
    );
  });

  it("rejects empty text screen content", () => {
    const input = `---
source_id: test-1
title: Test Course
author: Test Author
---

# Tema: Test Topic

## Lección: Test Lesson

### Pantalla: Empty Screen

`;

    expect(() => parseMarkdown(input)).toThrow(
      'text screen "Empty Screen" has no content',
    );
  });

  it("rejects unmatched bold marker in question", () => {
    const input = `---
source_id: test-1
title: Test Course
author: Test Author
---

# Tema: Test Topic

## Lección: Test Lesson

### Pantalla: Test Screen

---

type: multiple-choice
multiple: false
question: "What is **this?"
options:
  - a
  - b
correct: [0]
explanation: Why.
---

`;

    expect(() => parseMarkdown(input)).toThrow(
      'unmatched bold marker "**" in question',
    );
  });

  it("parses a full course with all screen types", () => {
    const input = `---
source_id: full-1
title: Full Course
author: Test Author
version: "2.0"
---

# Tema: Chemistry

## Lección: Atoms

### Pantalla: Intro

Welcome to chemistry basics.

### Pantalla: Quiz

---

type: multiple-choice
multiple: false
question: What is H2O?
options:
  - Water
  - Helium
  - Oxygen
correct: [0]
explanation: H2O is water.
---

### Pantalla: Drag

---

type: drag-drop
reusable: false
text: "The [___] is a noble gas."
question: "Fill in"
pool:
  - Helium
  - Water
blanks:
  - id: 1
    answer: Helium
explanation: Helium is a noble gas.
---

`;

    const course = parseMarkdown(input);

    expect(course.source_id).toBe("full-1");
    expect(course.version).toBe("2.0");
    expect(course.topics).toHaveLength(1);

    const screens = course.topics[0].lessons[0].screens;
    expect(screens).toHaveLength(3);

    expect(screens[0].type).toBe("text");
    if (screens[0].type === "text") {
      expect(screens[0].nodes).toHaveLength(1);
    }

    expect(screens[1].type).toBe("multiple-choice");
    if (screens[1].type === "multiple-choice") {
      expect(screens[1].question).toBe("What is H2O?");
      expect(screens[1].options).toHaveLength(3);
      expect(screens[1].correct).toEqual([0]);
    }

    expect(screens[2].type).toBe("drag-drop");
    if (screens[2].type === "drag-drop") {
      expect(screens[2].pool).toHaveLength(2);
      expect(screens[2].blanks).toHaveLength(1);
    }
  });
});
