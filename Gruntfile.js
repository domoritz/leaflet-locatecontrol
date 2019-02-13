module.exports = function(grunt) {

  var banner = '/*! Version: <%= pkg.version %>\nCopyright (c) 2016 Dominik Moritz */\n';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: banner,
        preserveComments: false,
        sourceMap: true
      },
      build: {
        src: 'src/L.Control.Locate.js',
        dest: 'dist/L.Control.Locate.min.js'
      }
    },
    sass: {
      dist: {
        options: {
          style: 'compressed'
        },
        files: {
          'dist/L.Control.Locate.min.css': 'src/L.Control.Locate.scss',
          'dist/L.Control.Locate.mapbox.min.css': 'src/L.Control.Locate.mapbox.scss'
        }
      },
      uncompressed: {
        options: {
          style: 'expanded'
        },
        files: {
          'dist/L.Control.Locate.css': 'src/L.Control.Locate.scss',
          'dist/L.Control.Locate.mapbox.css': 'src/L.Control.Locate.mapbox.scss'
        }
      }
    },
    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        commitFiles: [
          'package.json',
          'bower.json',
          'dist/L.Control.Locate.css',
          'dist/L.Control.Locate.min.css',
          'dist/L.Control.Locate.min.css.map',
          'dist/L.Control.Locate.mapbox.css',
          'dist/L.Control.Locate.mapbox.min.css',
          'dist/L.Control.Locate.mapbox.min.css.map',
          'dist/L.Control.Locate.min.js',
          'dist/L.Control.Locate.min.js.map'
        ],
        push: false
      }
    },
    connect: {
      server: {
        options: {
          port: 9000,
          protocol: 'https',
          keepalive: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Default task(s).
  grunt.registerTask('default', ['uglify', 'sass']);

};
