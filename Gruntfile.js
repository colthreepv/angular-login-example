module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-html2js');

  grunt.initConfig({
    html2js: {
      /**
       * These are the templates from `src/app`.
       */
      app: {
        options: {
          base: 'src'
        },
        src: [ 'src/**/*.tpl.html' ],
        dest: 'src/templates-app.js'
      }
    }
  });

  grunt.registerTask('templates', ['html2js']);
  grunt.registerTask('default', ['templates']);
};
