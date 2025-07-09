const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");
const globals = require("globals");

module.exports = [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        myCustomGlobal: "readonly"
      }
    }
  },
  {
    files: ["src/L.Control.Locate.js"],
    languageOptions: {
      parser: "espree", // JS parser natif d'ESLint
      ecmaVersion: 2022,
      sourceType: "script", // important si le fichier n'utilise pas import/export
      globals: {
        ...globals.browser
      }
    },
    rules: {
      // désactive les règles potentiellement conflictuelles
      "no-unused-vars": "off",
      "no-undef": "off",
      "prettier/prettier": "off"
    }
  },
  {
    ignores: ["*.min.js"]
  },
  eslintPluginPrettierRecommended
];
