import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));
const banner = `/*! Version: ${pkg.version}\nCopyright (c) 2016 Dominik Moritz */\n`;

const footer = `
(function() {
  if (typeof window !== 'undefined' && window.L) {
    window.L.control = window.L.control || {};
    window.L.control.locate = window.L.Control.Locate.locate;
  }
})();
`;

export default [
  // ESM build
  {
    input: "src/L.Control.Locate.js",
    external: ["leaflet"],
    output: {
      file: "dist/L.Control.Locate.esm.js",
      format: "es"
    },
    plugins: [nodeResolve(), commonjs()]
  },
  // UMD build
  {
    input: "src/L.Control.Locate.js",
    external: ["leaflet"],
    output: {
      file: "dist/L.Control.Locate.umd.js",
      format: "umd",
      name: "L.Control.Locate",
      globals: {
        leaflet: "L"
      },
      esModule: true,
      footer: footer
    },
    plugins: [nodeResolve(), commonjs()]
  },
  // Minified UMD build
  {
    input: "src/L.Control.Locate.js",
    external: ["leaflet"],
    output: {
      file: "dist/L.Control.Locate.min.js",
      format: "umd",
      name: "L.Control.Locate",
      globals: {
        leaflet: "L"
      },
      esModule: true,
      banner: banner,
      footer: footer,
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      terser({
        format: {
          comments: false,
          preamble: banner
        }
      })
    ]
  }
];
