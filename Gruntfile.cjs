module.exports = function (grunt) {
  var banner = "/*! Version: <%= pkg.version %>\nCopyright (c) 2016 Dominik Moritz */\n";

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
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
    }
  });

  grunt.loadNpmTasks("grunt-bump");
  grunt.loadNpmTasks("grunt-contrib-connect");

  // Default task(s).
  grunt.registerTask("default", []);
};
