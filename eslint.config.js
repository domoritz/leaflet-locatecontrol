import { defineConfig, globalIgnores } from "eslint/config";
import css from "@eslint/css";
import globals from "globals";

export default defineConfig([
  globalIgnores(["dist/*"]),
  { files: ["**/*.css"], plugins: { css }, language: "css/css", extends: ["css/recommended"], rules: { "css/use-baseline": "off", "css/no-important": "off" } },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser
      }
    }
  }
]);
