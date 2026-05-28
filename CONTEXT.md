# MovilApp

Aplicación móvil open source para estudiar con cursos generados a partir de archivos de texto estructurados.

## Language

### Conceptos principales

**Archivo fuente**:
El archivo `.md` en crudo que contiene la definición de un curso siguiendo el template.
_Evitar_: Documento, texto, contenido, material

**Curso**:
El resultado del parseo de un Archivo fuente. Contiene temas, lecciones y pantallas estructuradas. Es lo que la app renderiza y sobre lo que se trackea el progreso.
_Evitar_: Archivo, documento, módulo

**Template**:
El formato Markdown + YAML que define cómo estructurar un Archivo fuente para que el parser lo procese correctamente.
_Evitar_: Formato, esquema, spec

**Parser**:
El módulo que lee un Archivo fuente, valida su estructura contra el Template, y produce un Curso.
_Evitar_: Lector, intérprete, importador

**source_id**:
Identificador canónico de un Curso. Definido en el frontmatter del Template. Si no se provee, se deriva del hash del Archivo fuente. Es la llave primaria en la base de datos.
_Evitar_: ID, UUID, identificador

**Tema**:
Un capítulo o sección dentro de un Curso. Agrupa lecciones relacionadas. Ej: "Álgebra".
_Evitar_: Capítulo, módulo, unidad, sección

**Lección**:
Una secuencia lineal de Pantallas dentro de un Tema. Ej: "Operaciones con fracciones".
_Evitar_: Clase, unidad, capítulo

**Pantalla**:
Una unidad atómica dentro de una Lección. Puede ser de tipo texto, actividad o fin.
_Evitar_: Página, slide, paso, vista

### Tipos de pantalla

**Pantalla de texto**:
Pantalla que muestra contenido explicativo con formato inline (negrita, itálica, código). No tiene interacción más allá del botón "Continuar".
_Evitar_: Teoría, contenido, lectura

**Actividad**:
Pantalla interactiva donde el usuario responde ejercicios. Existen dos tipos: selección múltiple y drag-drop.
_Evitar_: Ejercicio, prueba, evaluación, quiz

**Selección múltiple**:
Actividad donde el usuario elige una o varias opciones correctas de una lista.
_Evitar_: Multiple choice, opción múltiple, test

**Drag-drop**:
Actividad donde el usuario arrastra ítems de un Pool hacia espacios vacíos (Blanks) en un texto.
_Evitar_: Arrastrar y soltar, matching, ordenamiento

**Pool**:
El conjunto de ítems arrastrables en una actividad Drag-drop. La app los baraja antes de mostrarlos.
_Evitar_: Banco, opciones, lista, items

**Blank**:
Un espacio vacío `[___]` en el texto de una actividad Drag-drop donde el usuario coloca un ítem del Pool.
_Evitar_: Hueco, espacio, casilla, placeholder

**Pantalla de fin**:
Pantalla estandarizada que marca la finalización de una Lección. Muestra un checkmark, el nombre de la lección y botones de navegación.
_Evitar_: Pantalla final, resumen, conclusión

### Interacción

**Explicación**:
Texto obligatorio en toda Actividad que el usuario puede consultar después de responder (correcta o incorrectamente). Explica el razonamiento detrás de la respuesta correcta.
_Evitar_: Solución, respuesta, justificación, feedback

**Reintentar**:
Acción que reinicia una Actividad a su estado inicial, borrando todas las selecciones o blanks rellenados.
_Evitar_: Rehacer, resetear, volver a intentar

**Ver respuesta correcta**:
Acción disponible tras una respuesta incorrecta. Revela visualmente cuál era la respuesta correcta en la Actividad.
_Evitar_: Mostrar solución, revelar, enseñar respuesta

### Gamificación

**Progreso**:
El estado de avance del usuario en un Curso. Se mide por Lección: completada o no completada. También se trackea la Pantalla actual dentro de una Lección en progreso para permitir reanudar.
_Evitar_: Avance, tracking, historia

**Lección completada**:
Una Lección cuyo usuario alcanzó la Pantalla de fin, independientemente de cuántos intentos incorrectos tuvo en las actividades.
_Evitar_: Lección terminada, lección finalizada, lección aprobada

**Racha**:
Número de días consecutivos en los que el usuario completó al menos 1 Lección. Se rompe (vuelve a 0) si un día no hay actividad y no tiene Freezes disponibles.
_Evitar_: Streak

**Freeze**:
Token que protege la Racha por un día sin actividad. Se gana 1 por semana al completar 4 o más Lecciones en esa semana. Máximo 2 acumulables. Se consume automáticamente al final del día si no hubo actividad.
_Evitar_: Congelador, escudo, protección, día libre

**Meta semanal**:
Objetivo configurable de Lecciones completadas por semana (lunes a domingo). Se resetea cada lunes. Distinta de la Racha (que es diaria y fija).
_Evitar_: Objetivo, goal, target

### Navegación

**Dashboard**:
Pantalla principal (tab Inicio). Muestra Racha, Freezes, Meta semanal, acceso rápido a continuar donde se quedó, y lista de Cursos en progreso.
_Evitar_: Home, inicio, principal, landing

**Catálogo**:
Pantalla (tab Cursos) que lista todos los Cursos instalados y permite importar nuevos Archivos fuente.
_Evitar_: Biblioteca, lista de cursos, mis cursos

**Roadmap**:
Vista de timeline dentro de un Tema que muestra todas las Lecciones con su estado (completada, en progreso, sin empezar). Permite navegar a cualquier Lección.
_Evitar_: Lista de lecciones, camino, ruta, índice

**Visor**:
Pantalla a pantalla completa (sin tabs) donde se renderiza una Lección. Muestra las Pantallas secuencialmente con animación slide.
_Evitar_: Reproductor, lector, vista de lección

### Estados

**Importar**:
El flujo completo de añadir un Curso a la app: seleccionar un Archivo fuente, validarlo con el Parser, previsualizarlo y confirmar.
_Evitar_: Agregar, descargar, subir

**Lección en progreso**:
Una Lección que el usuario empezó pero cuya Pantalla de fin no ha sido alcanzada. Se guarda el índice de la última Pantalla visitada para reanudar.
_Evitar_: Lección empezada, lección a medias, lección pendiente

## Relationships

- Un **Archivo fuente** es parseado por el **Parser** para producir exactamente un **Curso**.
- Un **Curso** contiene uno o más **Temas**.
- Un **Tema** contiene una o más **Lecciones**.
- Una **Lección** contiene una o más **Pantallas** (al menos una Pantalla de fin).
- Una **Actividad** tiene exactamente una **Explicación**.
- Un **Drag-drop** tiene un **Pool** (ítems arrastrables) y uno o más **Blanks** (espacios destino).
- Una **Lección completada** alimenta la **Racha** y la **Meta semanal**.
- Un **Freeze** protege la **Racha** por exactamente un día sin actividad.

## Example dialogue

> **Dev:** "Si un usuario importa un **Archivo fuente** dos veces, ¿se crean dos **Cursos**?"
> **Domain expert:** "No — el **Parser** detecta el **source_id** duplicado y ofrece reemplazar el **Curso** existente. El **Progreso** se conserva."
>
> **Dev:** "¿Una **Lección completada** sin haber acertado ninguna **Actividad** sigue contando para la **Racha**?"
> **Domain expert:** "Sí. El objetivo es aprender, no evaluar. Si el usuario leyó las **Explicaciones** y llegó a la **Pantalla de fin**, la lección cuenta."
>
> **Dev:** "Si un usuario completa 3 **Lecciones** esta semana, ¿gana un **Freeze**?"
> **Domain expert:** "No — se necesitan al menos 4 **Lecciones completadas** en la semana para ganar 1 **Freeze** el lunes siguiente."
