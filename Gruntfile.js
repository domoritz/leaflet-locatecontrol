module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! Version: <%= pkg.version %>\nDate: <%= grunt.template.today("yyyy-mm-dd") %> */\n',
      	preserveComments: 'some'
      },
      build: {
        src: 'src/L.Control.Locate.js',
        dest: 'dist/L.Control.Locate.min.js'
      }
    },
    sass: {
      dist: {
        options: {
          style: 'compressed'  // debug with 'expanded'
        },
        files: {
          'dist/L.Control.Locate.min.css': 'src/L.Control.Locate.scss',
          'dist/L.Control.Locate.ie.min.css': 'src/L.Control.Locate.ie.scss'
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