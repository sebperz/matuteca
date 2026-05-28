# Matuteca

Aplicación móvil open source para estudiar con cursos generados a partir de archivos de texto estructurados (Markdown + YAML).

Importa archivos `.md` que sigan el template definido, y la app los convierte en cursos interactivos con temas, lecciones y actividades (selección múltiple y drag-drop). Incluye sistema de progreso, rachas y gamificación.

## Requisitos previos

- **Node.js** (versión 18 o superior)
- **npm** (incluido con Node.js)
- **Expo Go** instalado en tu dispositivo móvil ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)), o un emulador configurado

## Instalación

```bash
git clone <url-del-repositorio>
cd matuteca
npm install
```

## Ejecución

```bash
npx expo start
```

Esto abrirá el servidor de desarrollo de Expo. Escanea el código QR con Expo Go (Android/iOS) o presiona `a` para abrir en emulador Android / `i` para iOS.

### Otros comandos

| Comando | Descripción |
|---|---|
| `npm start` | Inicia el servidor de desarrollo |
| `npm test` | Ejecuta los tests con Jest |
| `npm run ts:check` | Verifica tipos con TypeScript |
