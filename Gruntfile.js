module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    less: {
      build: {
        options: {
          paths: ["css"]
        },
        files: {
          "css/style.css": "css/style.less"
        }
      }
    },
    jekyll: {
      build: {
        options: {
          config: '_config.yml',
          serve: false
        }
      },
      serve: {
        options: {
          config: '_config.yml',
          serve: true,
          port: 5000,
          nowatch: true
        }
      },
    },
    imagemin: {
      static: {
        options: {
          optimizationLevel: 7
        },
        files: [{
          expand: true,
          cwd: '_site/img',
          src: '*',
          dest: '_site/img'
        }]
      }
    },
    uncss: {
      dist: {
        options: {
          stylesheets: ['_site/css/style.css']
        },
        files: {
          '_site/css/style.css': ['*.html','**/*.html', '!node_modules/**/*.html']
        }
      }
    },
    cssmin: {
      dist: {
        expand: true,
        cwd: '_site/css/',
        src: ['*.css'],
        dest: '_site/css/'
      }
    },
    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          removeComments: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          minifyJS: true,
          minifyCSS: true
        },
        files: [
        {
          expand: true,
          cwd: '_site/',
          src: ['*.html','**/*.html'],
          dest: '_site/'
        }
        ]
      }
    },
    connect: {
      server: {
        options: {
          port: 4000,
          base: '_site',
          keepalive: true,
          hostname: '*'
        }
      }
    }
  });

  grunt.registerTask('build', ['less','jekyll:build']);
  grunt.registerTask('optimize', ['imagemin','uncss','cssmin','htmlmin']);
  grunt.registerTask('prod', ['build','optimize','connect']);
  grunt.registerTask('default', ['build','connect']);

};

