import terser from "@rollup/plugin-terser";
import pkg from "./package.json" with { type: "json" };

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
      format: "es",
      banner: banner
    }
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
      banner: banner,
      footer: footer
    }
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
      terser({
        format: {
          comments: false,
          preamble: banner
        }
      })
    ]
  }
];
