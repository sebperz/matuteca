# 0002 — source_id híbrido como identificador canónico de Curso

Cada Curso se identifica por su `source_id`, definido por el autor en el frontmatter del Template. Si el autor no provee un `source_id`, la app lo deriva del hash SHA-256 del Archivo fuente.

## Por qué

- **Estabilidad ante ediciones menores**: si un docente corrige una tilde o un espacio, el hash cambiaría y el Progreso se perdería. Con `source_id` explícito en el frontmatter, el autor controla cuándo una versión es "nueva".
- **Determinismo como fallback**: si el autor no define `source_id`, el hash SHA-256 garantiza unicidad sin intervención humana. Dos usuarios que importen el mismo archivo obtienen el mismo ID.
- **Sync-ready**: un identificador determinístico permite que dos dispositivos reconozcan que tienen "el mismo" Curso sin necesidad de un servidor central que asigne IDs.

## Alternativas consideradas

- **Hash puro**: 100% determinístico, pero cualquier edición —incluso cosmética— rompe la asociación con el Progreso del usuario.
- **Frontmatter obligatorio**: estable, pero requiere disciplina del creador. Un docente nuevo que omita el campo no podría usar la app.
- **UUID aleatorio al importar**: simple de implementar, pero no determinístico. Dos usuarios que importen el mismo archivo tendrían IDs distintos, imposibilitando cualquier sync futuro.

## Consecuencias

- El `source_id` es texto (no numérico), lo que afecta el tamaño de índices en SQLite. El volumen de datos esperado (~cientos de Cursos como máximo) hace que el impacto sea despreciable.
- La app debe detectar `source_id` duplicados al importar y ofrecer reemplazar el Curso existente conservando el Progreso previo.
- Si un autor cambia el `source_id` entre versiones del mismo curso, la app lo trata como un Curso nuevo y el Progreso anterior queda asociado al viejo (no se migra automáticamente).
