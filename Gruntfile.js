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
    cssmin: {
    	combine: {
    		files: {
    			'dist/L.Control.Locate.min.css': ['src/L.Control.Locate.css'],
    			'dist/L.Control.Locate.ie.min.css': ['src/L.Control.Locate.ie.css']
    		}
    	}
    },
    bump: {
	    options: {
			files: ['package.json', 'bower.json'],
			push: false
	    }
	  },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-bump');

  // Default task(s).
  grunt.registerTask('default', ['uglify', 'cssmin']);

};