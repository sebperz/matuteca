const {
  withTypescriptMapping,
} = require("jest-expo/src/preset/withTypescriptMapping");

const cloneDeep = require("lodash/cloneDeep");

const jestPreset = cloneDeep(require("@react-native/jest-preset"));

jestPreset.moduleNameMapper = {
  ...(jestPreset.moduleNameMapper || {}),
  "^react-native-vector-icons$": "@expo/vector-icons",
  "^react-native-vector-icons/(.*)": "@expo/vector-icons/$1",
};

const upstreamBabelJest = Object.keys(jestPreset.transform).find(
  (key) => jestPreset.transform[key] === "babel-jest",
);
if (upstreamBabelJest) {
  delete jestPreset.transform[upstreamBabelJest];
}

jestPreset.transform["\\.[jt]sx?$"] = [
  "babel-jest",
  {
    presets: [[require.resolve("babel-preset-expo"), { lazyImports: true }]],
    caller: { name: "metro", bundler: "metro", platform: "ios" },
  },
];

const assetExts = [
  "bmp", "gif", "jpg", "jpeg", "png", "psd", "svg", "webp", "xml",
  "m4v", "mov", "mp4", "mpeg", "mpg", "webm",
  "aac", "aiff", "caf", "m4a", "mp3", "wav",
  "html", "pdf", "yaml", "yml",
  "otf", "ttf", "zip", "heic", "avif", "db",
];

jestPreset.transform[`^.+\\.(${assetExts.join("|")})$`] =
  require.resolve("jest-expo/src/preset/assetFileTransformer.js");

jestPreset.transformIgnorePatterns = [
  "/node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)",
];

if (!Array.isArray(jestPreset.setupFiles)) {
  jestPreset.setupFiles = [];
}
jestPreset.setupFiles.push(require.resolve("jest-expo/src/preset/setup.js"));

module.exports = withTypescriptMapping(jestPreset);
