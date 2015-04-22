var jpegRecompress = require('imagemin-jpeg-recompress');
var https = require('https');
var http = require('http');
var fs = require('fs');
var moment = require('moment');
var slug = require('slug');
var matter = require('gray-matter');

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
          config: {'user.name': 'Travis CI', "user.email": "ryanbrooksis+ci@gmail.com"},
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

  grunt.registerTask('buildMeetupPosts', 'Fetches all events from Meetup.com and creates Jekyll posts where they dont exist', function(){
    var done = this.async();
    var allEventsQuery = "https://api.meetup.com/2/events?offset=0&format=json&limited_events=False&group_id=17778422&photo-host=secure&page=100&fields=&order=time&status=past%2Cupcoming&desc=false&sig_id=153356042&sig=66887b77c34d304571d20465b10229ce582b7e02";
    var total = 0, complete = 0;

    function postComplete(){
      if(++complete === total){
        done();
      }
    }

    function getFilename(post){
      var title,filename;

      title = slug(post.name);
      filename = '_posts/'+moment(post.time).format('YYYY-MM-DD')+'-'+title+'.md';
      
      return filename;
    }

    function processPost(post){
      var outputString = matter.stringify(
        post.description,
        {
          '!':'Note: This post has been auto-generated from a Meetup.com event',
          published: true,
          layout: 'post',
          title: post.name,
          date: moment(post.time).format('YYYY-MM-DD HH:mm:ss'),
          source: 'meetup',
          attendees: post.yes_rsvp_count,
          externalURL: post.event_url,
          status: post.status
        }
      );
      fs.writeFile(getFilename(post), outputString, function(err) {
        if(err) return console.log(err);
        postComplete();
      }); 
    }

    https.get(allEventsQuery, function(res){
      var body = '';
      res.on('data', function(d){
        body += d;
      });
      res.on('end', function(){
        var events = JSON.parse(body).results;
        var i=0, len = events.length;
        total = len;
        for(i=0;i<len;i++){
          processPost(events[i]);
        }
      });
    });
  });

  grunt.registerTask('meetup', 'buildMeetupPosts');
  grunt.registerTask('build', ['less','meetup','jekyll:build']);
  grunt.registerTask('optimize', ['cssmin','uncss','imagemin','uglify','htmlmin']);
  grunt.registerTask('deploy', ['build','optimize','buildcontrol']);
  grunt.registerTask('default', ['build','jekyll:serve']);

};
