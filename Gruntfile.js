module.exports = function (grunt) {
  var banner = "/*! Version: <%= pkg.version %>\nCopyright (c) 2016 Dominik Moritz */\n";

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    copy: {
      tsd: {
        src: "src/L.Control.Locate.d.ts",
        dest: "dist/L.Control.Locate.d.ts"
      }
    },
    uglify: {
      options: {
        banner: banner,
        preserveComments: false,
        sourceMap: true
      },
      build: {
        src: "dist/L.Control.Locate.umd.js",
        dest: "dist/L.Control.Locate.min.js"
      }
    },
    bump: {
      options: {
        files: ["package.json", "bower.json"],
        commitFiles: [
          "package.json",
          "package-lock.json",
          "bower.json",
          "dist/L.Control.Locate.css",
          "dist/L.Control.Locate.min.css",
          "dist/L.Control.Locate.min.css.map",
          "dist/L.Control.Locate.d.ts",
          "dist/L.Control.Locate.esm.js",
          "dist/L.Control.Locate.mapbox.css",
          "dist/L.Control.Locate.mapbox.min.css",
          "dist/L.Control.Locate.mapbox.min.css.map",
          "dist/L.Control.Locate.min.js",
          "dist/L.Control.Locate.min.js.map"
        ],
        push: false
      }
    },
    connect: {
      server: {
        options: {
          port: 9000,
          protocol: "https",
          keepalive: true
        }
      }
    },
    rollup: {
      options: {
        plugins: [require("@rollup/plugin-node-resolve").nodeResolve(), require("@rollup/plugin-commonjs")()]
      },
      build_es: {
        options: {
          format: "es",
          external: ["leaflet"]
        },
        files: {
          "dist/L.Control.Locate.esm.js": "src/L.Control.Locate.js"
        }
      },
      build_umd: {
        options: {
          format: "umd",
          name: "L.Control.Locate",
          external: ["leaflet"],
          globals: {
            leaflet: "L"
          },
          footer: `
            (function() {
              if (typeof window !== 'undefined' && window.L) {
                window.L.control = window.L.control || {};
                window.L.control.locate = window.L.Control.Locate.locate;
              }
            })();
          `
        },
        files: {
          "dist/L.Control.Locate.umd.js": "src/L.Control.Locate.js"
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-rollup");
  grunt.loadNpmTasks("grunt-bump");
  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-contrib-copy");

  // Default task(s).
  grunt.registerTask("default", ["rollup:build_es", "rollup:build_umd", "copy", "uglify"]);
};
