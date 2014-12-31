module.exports = function(grunt) {

  var banner = '/*! Version: <%= pkg.version %>\nDate: <%= grunt.template.today("yyyy-mm-dd") %> */\n';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: banner,
        preserveComments: 'some',
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
          banner: banner,
          style: 'compressed'
        },
        files: {
          'dist/L.Control.Locate.min.css': 'src/L.Control.Locate.scss',
          'dist/L.Control.Locate.ie.min.css': 'src/L.Control.Locate.ie.scss'
        }
      },
      uncompressed: {
        options: {
          banner: banner,
          style: 'expanded',
          sourcemap: 'none'
        },
        files: {
          'dist/L.Control.Locate.css': 'src/L.Control.Locate.scss',
          'dist/L.Control.Locate.ie.css': 'src/L.Control.Locate.ie.scss'
        }
      }
    },
    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        commitFiles: ['package.json', 'bower.json'],
        push: false
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-serve');

  // Default task(s).
  grunt.registerTask('default', ['uglify', 'sass']);

};