var jpegRecompress = require('imagemin-jpeg-recompress');

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
      options: {
        bundleExec: true
      },
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
          optimizationLevel: 7,
          use: [jpegRecompress()]
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
          stylesheets: ['_site/css/style.css'],
          ignore: [
            '.post',
            '.post-title',
            /.eventInfo.*/,
            /#MeetupMembers.*/,
            /.collapse.*/,
            /.in.*/,
	    /col-xs-3.*/,
	    /col-xs-9.*/
          ]
        },
        files: {
          '_site/css/style.css': ['*.html','**/*.html', '!node_modules/**/*.html']
        }
      },
    },
    cssmin: {
      dist: {
        files: {
          '_site/css/style.css': ['_site/css/style.css']
        }
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
    uglify: {
      dist: {
        options: {
          sourceMap: true
        },
        files: {
          '_site/js/script.js': ['_site/js/script.js']
        }
      }
    },
    buildcontrol: {
      dist: {
        options: {
          config: {'user.name': 'JSOxbot', "user.email": "jsoxford@whiteoctober.co.uk"},
          login: process.env.GH_LOGIN,
          token: process.env.GH_TOKEN,
          dir: '_site',
          remote: 'https://github.com/jsoxford/jsoxford.github.com',
          branch: 'master',
          commit: true,
          push: true
        }
      }
    },
  });

  grunt.registerTask('build', ['less','jekyll:build']);
  grunt.registerTask('optimize', ['cssmin','uncss','imagemin','uglify','htmlmin']);
  grunt.registerTask('deploy', ['build','optimize','buildcontrol']);
  grunt.registerTask('default', ['build','jekyll:serve']);

};
