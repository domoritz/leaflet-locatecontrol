import path from "node:path";
import { rollup } from "rollup";
import { defineConfig } from "vite";
import rollupConfig from "./rollup.config.js";

const SRC = path.resolve("src");

/**
 * Serve the plugin from `src/` in place of `dist/`, so the demos pick up changes without a rebuild.
 * The demos still reference `dist/`, because that is what the published GitHub pages use.
 */
function serveSrcAsDist() {
  // The unminified UMD build from rollup.config.js, generated on demand for the script-tag demos.
  const umdConfig = rollupConfig.find((config) => config.output.format === "umd" && !config.plugins);

  return {
    name: "serve-src-as-dist",
    enforce: "pre",

    // The ESM demos load Leaflet from a CDN with an import map, so it must not come from node_modules.
    // That keeps e.g. demo/esm/leaflet2.html on Leaflet 2 even though node_modules has Leaflet 1.
    // Vite still rewrites the external import to `/@id/leaflet`, which is undone in the middleware below.
    resolveId(source) {
      if (source === "leaflet") {
        return { id: "leaflet", external: true };
      }
      if (source.endsWith("/dist/L.Control.Locate.esm.js")) {
        return path.join(SRC, "L.Control.Locate.js");
      }
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url.split("?")[0];

        if (url.endsWith(".js")) {
          // Restore the bare `leaflet` import so that the browser resolves it with the page's import map.
          const end = res.end.bind(res);
          res.end = (chunk, ...args) => {
            if (chunk !== undefined && typeof chunk !== "function") {
              const code = chunk.toString().replaceAll('"/@id/leaflet"', '"leaflet"');
              res.setHeader("Content-Length", Buffer.byteLength(code));
              return end(code, ...args);
            }
            return end(chunk, ...args);
          };
        }

        const css = url.match(/\/dist\/(L\.Control\.Locate(?:\.mapbox)?)(?:\.min)?\.css$/);
        if (css) {
          req.url = `/src/${css[1]}.css`;
          return next();
        }

        if (/\/dist\/L\.Control\.Locate\.(?:min|umd)\.js$/.test(url)) {
          try {
            const bundle = await rollup({ input: umdConfig.input, external: umdConfig.external });
            const { output } = await bundle.generate({ ...umdConfig.output, file: undefined, sourcemap: "inline" });
            await bundle.close();
            res.setHeader("Content-Type", "text/javascript");
            res.setHeader("Cache-Control", "no-cache");
            return res.end(output[0].code);
          } catch (err) {
            return next(err);
          }
        }

        next();
      });

      // Reload the page when the source changes, also for the UMD demos that Vite doesn't track.
      server.watcher.on("change", (file) => {
        if (file.startsWith(SRC + path.sep)) {
          server.ws.send({ type: "full-reload" });
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [serveSrcAsDist()],
  server: {
    port: 9000,
    // Vite would otherwise try (and fail) to load the external `leaflet` module ahead of time.
    preTransformRequests: false
  }
});
