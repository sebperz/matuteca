# 0001 — Arquitectura local-first sin backend

Matuteca usa SQLite local (`expo-sqlite`) como única fuente de verdad. No hay backend, autenticación ni sincronización en la nube en el MVP.

## Por qué

- **Open source first**: cualquier usuario puede clonar, instalar y usar la app sin depender de infraestructura externa. No requiere cuentas, APIs ni servicios pagos.
- **Offline por diseño**: todo el contenido (Cursos, Progreso, Rachas) funciona sin conexión. No hay modos degradados ni estados de carga de red.
- **Complejidad mínima en MVP**: un backend añadiría autenticación, API layer, manejo de sesiones y conflict resolution — cada uno con su superficie de bugs.

## Alternativas consideradas

- **Firebase / Supabase**: añadían vendor lock-in, requerían auth obligatoria y complejizaban el modelo de datos con sincronización bidireccional.
- **Convex**: excelente DX reactivo, pero requiere auth, conexión permanente, y contradice el principio offline-first. Más adecuado si surge demanda de multi-dispositivo.
- **Backend propio**: sobredimensionado para MVP. Diferido para cuando haya necesidad real.

## Consecuencias

- Si el usuario pierde su dispositivo, pierde su Progreso (hasta que exista sync).
- El modelo de datos usa IDs determinísticos (`source_id`) para facilitar una migración futura a sync — la combinación `(source_id, topic_index, lesson_index)` es globalmente única y portable.
- La tabla `settings` usa key-value para flexibilidad. `lesson_progress` está diseñada para que un futuro sync sea UPSERT sobre clave compuesta.
