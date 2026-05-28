# 0003 — Template en Markdown + YAML para authoring de cursos

Los Cursos se definen en archivos `.md` que combinan frontmatter YAML, headings jerárquicos para la estructura (`# Tema:`, `## Lección:`, `### Pantalla:`), y bloques YAML delimitados por `---` para Actividades interactivas.

## Por qué

- **Author experience primero**: un docente sin conocimientos técnicos puede escribir un Curso en cualquier editor de texto. La estructura se define con headings markdown, familiares para cualquiera que haya escrito documentación.
- **IA-friendly**: el formato es markdown estándar. Los creadores pueden usar ChatGPT, Claude o cualquier LLM para generar Archivos fuente siguiendo el Template que la app documenta.
- **Un solo archivo por Curso**: facilita compartir, versionar y distribuir. Un Curso es un archivo que se pasa por WhatsApp, se hostea en GitHub, o se incluye en `assets/courses/`.
- **Legibilidad humana**: el autor ve el Curso completo en un solo archivo. Las Pantallas de texto son markdown puro (no YAML). Solo las Actividades usan bloques estructurados.

## Alternativas consideradas

- **JSON puro**: más fácil de parsear y validar con `JSON.parse` + Zod, pero hostil para autores humanos. Requiere escapar strings manualmente, manejar comas, y no soporta texto libre con formato inline de forma natural.
- **YAML puro**: más legible que JSON, pero sin soporte nativo para bloques de texto largo con formato inline (markdown). La indentación de YAML es propensa a errores para jerarquías profundas como Curso → Tema → Lección → Pantalla.
- **DSL propio**: máxima flexibilidad y control de validación, pero requiere que cada autor aprenda una sintaxis nueva. Incompatible con herramientas externas (editores, linters, IA).

## Consecuencias

- El Parser debe manejar dos gramáticas (markdown para estructura + YAML para actividades) en vez de una sola. Esto añade complejidad de implementación y testing.
- La validación debe ser estricta: un autor puede fácilmente escribir mal un campo YAML, romper la jerarquía de headings, o anidar incorrectamente los bloques.
- El formato inline (bold, italic, code) requiere un mini-parser propio porque no usamos una librería de markdown completa — solo necesitamos tres estilos.
