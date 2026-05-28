# Template Specification

Version 1.0.0

The Matuteca template is the canonical format for authoring courses. A course is a single `.md` file with YAML frontmatter, hierarchical markdown headings for structure, and YAML code blocks for interactive activities.

---

## File structure

```
---
source_id: <string>       # required
title: <string>           # required
author: <string>          # required
version: <string>         # optional
---

# Tema: <tema-title>

## Lección: <lesson-title>

### Pantalla: <screen-title>

Markdown content here. This is a text screen.

### Pantalla: <screen-title>

---
type: multiple-choice
multiple: false
question: <string>
options:
  - <string>
  - <string>
correct: [<int>]
explanation: <string>
### Pantalla: <screen-title>

---
type: end
---
```

---

## Structural rules

### Frontmatter

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `source_id` | Yes | string | Canonical identifier. Used as primary key in the database. Must be unique per course version. |
| `title` | Yes | string | Display title of the course. |
| `author` | Yes | string | Author or community name. |
| `version` | No | string | Semantic or numeric version. Reserved for future migration support. |

### Headings

Headings define the course hierarchy:

| Prefix | Meaning |
|--------|---------|
| `# Tema:` | A topic (chapter/section) within the course |
| `## Lección:` | A lesson within a topic |
| `### Pantalla:` | A screen within a lesson |

All heading text after the prefix is the display name. Example: `# Tema: Álgebra` → topic titled "Álgebra".

### Screen types

A screen is defined by either:

1. **Implicit text** — markdown content below `### Pantalla:` that is not inside a YAML block. Renders as a text-only screen.
2. **YAML block** — content delimited by `---` above and below. The `type` field determines behaviour.

A screen ends when the next `### Pantalla:`, `## Lección:`, `# Tema:`, or end-of-file is encountered.

---

## Activity screen types

All activity screens share these fields:

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `type` | Yes | string | One of `multiple-choice` or `drag-drop` |
| `question` | Yes | string | The prompt. Supports inline formatting. |
| `explanation` | Yes | string | Shown after the user answers (correct or incorrect). Supports inline formatting. |

### `multiple-choice`

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `multiple` | Yes | boolean | `false` = single correct answer (radio buttons). `true` = multiple correct answers (checkboxes). |
| `options` | Yes | array of strings | All choices. Min 2. Max 26 (A–Z). Supports inline formatting. |
| `correct` | Yes | array of integers | Zero-based indices of correct answers. If `multiple: false`, array must have exactly 1 element. |

Example:

```yaml
---
type: multiple-choice
multiple: false
question: ¿Cuánto es 1/2 + 1/4?
options:
  - 2/6
  - 3/4
  - 1/8
  - 5/8
correct: [1]
explanation: >-
  Para sumar fracciones con distinto denominador, buscamos
  un denominador común: 1/2 = 2/4, luego 2/4 + 1/4 = 3/4.
---
```

### `drag-drop`

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `reusable` | Yes | boolean | `false` = each pool item can be used once. `true` = items can be reused across multiple blanks. |
| `text` | Yes | string | The body text with `[___]` as placeholders for blanks. Supports inline formatting. |
| `pool` | Yes | array of strings | The draggable items. The app shuffles this before display. |
| `blanks` | Yes | array of objects | Each blank has `id` (integer) and `answer` (string). `id` maps to positional order in the text. `answer` must exist in `pool`. |

Example (fill-blanks, reusable):

```yaml
---
type: drag-drop
reusable: true
text: "El [___] es un gas noble. El [___] es el más ligero de todos los elementos."
pool:
  - helio
  - hidrógeno
  - oxígeno
  - carbono
blanks:
  - id: 1
    answer: helio
  - id: 2
    answer: hidrógeno
explanation: >-
  El helio (He) pertenece al grupo 18, los gases nobles.
  El hidrógeno (H) es el elemento más ligero y el más abundante del universo.
---
```

Example (ordering, single-use):

```yaml
---
type: drag-drop
reusable: false
text: "Pasos para resolver una ecuación:\n1. [___]\n2. [___]\n3. [___]"
pool:
  - Verificar la solución
  - Agrupar términos semejantes
  - Despejar la variable
blanks:
  - id: 1
    answer: Agrupar términos semejantes
  - id: 2
    answer: Despejar la variable
  - id: 3
    answer: Verificar la solución
explanation: >-
  Primero agrupamos términos semejantes a cada lado de la ecuación.
  Luego despejamos la variable aplicando operaciones inversas.
  Finalmente verificamos sustituyendo en la ecuación original.
---
```

### `end`

Marks the end of a lesson. No additional fields.

```yaml
---
type: end
---
```

Renders a standardized screen showing: lesson title, completion checkmark, "Go to menu" button, and "Next lesson" button (if a next lesson exists).

---

## Inline formatting

The following inline styles are supported within all string fields that mention "Supports inline formatting" above (`question`, `explanation`, `options`, `text`):

| Style | Syntax | Example |
|-------|--------|---------|
| **Bold** | `**text**` or `__text__` | `**importante**` → **importante** |
| *Italic* | `*text*` or `_text_` | `*énfasis*` → *énfasis* |
| `Code` | `` `text` `` | `` `print()` `` → `print()` |

Combinations: `**bold _and italic_**`, `` `code **not bold**` `` are supported.

Left/right symmetry must match: `**bold*` is invalid. Escaping: `\*literal asterisks\*` renders without formatting.

---

## Activity flow (app behaviour)

```
User submits answer
  │
  ├── Correct
  │     ├── [Ver explicación] → reads explanation → [Continuar]
  │     └── [Continuar]
  │
  └── Incorrect
        ├── [Reintentar] → resets activity to initial state
        └── [Ver respuesta correcta]
              ├── [Explicación] → reads explanation → [Continuar]
              └── [Saltar explicación] → [Continuar]
```

- `[Reintentar]` resets all selections/blanks to initial state.
- `[Ver respuesta correcta]` reveals the correct answer(s) visually on the activity.
- `explanation` is required for all activities.
- A lesson is marked **completed** when the user reaches the `end` screen (regardless of incorrect attempts).

### Activity header

In activity screens, the top bar shows:
- Left: back button (return to lesson roadmap)
- Right: reset button (clears current selections/blanks back to initial state)

---

## Validation rules

The parser MUST reject the file with a specific error message for each violation:

| Rule | Error example |
|------|--------------|
| Missing `source_id` | `[line 1] source_id is required in frontmatter` |
| Missing `title` | `[line 1] title is required in frontmatter` |
| Missing `author` | `[line 1] author is required in frontmatter` |
| Unknown `type` value | `[line 42] unknown screen type "multple-choice". Valid types: text, multiple-choice, drag-drop, end` |
| Missing `question` in activity | `[line 42] question is required for type multiple-choice` |
| Missing `explanation` in activity | `[line 42] explanation is required for type multiple-choice` |
| `multiple: true` with `correct` length != number of correct answers in `options` | `[line 45] correct must include all valid answers when multiple is true` |
| `multiple: false` with `correct` length != 1 | `[line 45] correct must have exactly 1 index when multiple is false` |
| `correct` index out of range | `[line 45] correct index 5 out of range (options has 4 items)` |
| `blanks` `answer` not in `pool` | `[line 50] blank 3 answer "Bogotá" not found in pool` |
| Duplicate `blank.id` | `[line 48] duplicate blank id 1` |
| Empty `pool` | `[line 46] pool must have at least 1 item` |
| `blanks` count != `[___]` count in text | `[line 47] 3 blanks defined but text has 2 [___] placeholders` |
| Malformed inline format | `[line 42] unmatched bold marker "**" in question` |
| `options` fewer than 2 | `[line 44] options must have at least 2 items` |
| `## Lección:` without `# Tema:` parent | `[line 30] lesson "Operaciones" has no parent topic` |
| `### Pantalla:` without `## Lección:` parent | `[line 55] screen "Intro" has no parent lesson` |
| Empty text content for `text` screen | `[line 60] text screen "Resumen" has no content` |

---

## Course import flow (app behaviour)

1. User taps "Import" in Courses tab.
2. System file picker opens, filtering to `.md` files.
3. On file selection:
   a. Content is read and parsed.
   b. If validation fails: specific errors are shown in a scrollable list. Course is NOT saved.
   c. If validation passes: a preview card shows (title, author, number of topics/lessons).
4. User taps "Install" on the preview card.
5. If `source_id` already exists in the database:
   - "This course is already installed. Replace it? (Your progress will be preserved.)"
   - [Cancel] / [Replace]
6. On install: course JSON is saved to SQLite. User is navigated to the course's topic view.

### Built-in courses

Courses shipped in `assets/courses/*.md` are parsed and installed on first app launch, same as imported courses. They are treated identically by the database and can be removed.
