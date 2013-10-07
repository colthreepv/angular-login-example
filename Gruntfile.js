module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({
    html2js: {
      /**
       * These are the templates from `src/app`.
       */
      app: {
        options: {
          base: 'src'
        },
        src: ['src/**/*.tpl.html'],
        dest: 'src/templates-app.js'
      }
    },
    less: {
      all: {
        src: 'style.less',
        dest: 'style.css',
        options: {
          report: 'gzip'
        }
      }
    },
    watch: {
      options: {
        atBegin: true
      },
      templates: {
        files: ['src/**/*.tpl.html'],
        tasks: ['html2js']
      },
      less: {
        files: ['style.less', 'src/**/*.less'],
        tasks: ['less']
      }
    }
  });

  grunt.registerTask('templates', ['html2js']);
  grunt.registerTask('build', ['templates', 'less']);
  grunt.registerTask('default', 'watch');
};
