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
          port: 4000,
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
      	    /col-xs-9.*/,
            /icon-thumb_.*/
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
    sprite:{
      all: {
        src: 'members/*',
        dest: 'img/memberssprites.png',
        destCss: 'css/sprites.css'
      }
    },
    clean: {
      members: {
        src: ["./members", './sprites']
      }
    },
  });


  grunt.task.registerTask('downloadmemberphotos', 'Downloads all member photos from Meetup.com', function() {
    var done = this.async();
    var completed = 0, total = 0;
    var membersQuery = "https://api.meetup.com/2/members?offset=0&format=json&group_id=17778422&only=photo%2Cname%2Clink&photo-host=secure&page=200&order=name&sig_id=153356042&sig=4d8e3265b4374b84aabb8efcc26eb8107a3ec81b";
    var https = require('https');
    var http = require('http');
    var fs = require('fs');
    var imageType = require('image-type');
    var lwip = require('lwip');

    // Create output dir
    if (!fs.existsSync('./members')){
        fs.mkdirSync('./members');
    }

    var increment = function(){
      if(++completed === total) done();
    };

    var fetchResults = function(url){
      https.get(url, function(res){
        var body = '';
        res.on('data', function(d) {
          body += d;
        });
        res.on('end', function() {
          var members = JSON.parse(body).results;
          total = JSON.parse(body).meta.total_count;
          processMembers(members);
          if(JSON.parse(body).meta.next){
            fetchResults(JSON.parse(body).meta.next);
          }
        });
      });
    };

    var processMembers = function(members){
      for(i=0;i<members.length;i++){
        if(members[i].photo){

          (function(memberPhoto){
            var filename = "members" + memberPhoto.substring(memberPhoto.lastIndexOf('/'));
            var file = fs.createWriteStream(filename);
            var imageBytes;
            http.get(memberPhoto, function(response) {
              var ext = 'jpg';
              // Meetup.com sends all images with .jpeg extension but the file type could be anything. Lets fix that!
              response.on('data', function(chunk){
                if(imageType(chunk) && imageType(chunk).ext){
                  ext = imageType(chunk).ext;
                }
              });
              response.on('end', function(){
                var newfilename = filename.replace('jpeg', ext);
                fs.rename(filename, newfilename, function(){
                  // Resize all images to 30x30.
                  lwip.open(newfilename, function(err, image){
                    if(err) {
                      grunt.log.writeln(err + " - ["+newfilename+"]");
                      fs.unlink(newfilename);
                      return increment();
                    }
                    image.batch()
                      .resize(30,30)
                      .writeFile(newfilename, function(err){
                        if(err){
                          grunt.log.writeln(err + " - ["+newfilename+"]");
                          fs.unlink(newfilename);
                        }
                        increment();
                      });
                  });
                });
              });
              response.pipe(file);
            });

          }(members[i].photo.thumb_link));

        }else{
          increment();
        }
      }
    };

    fetchResults(membersQuery);

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
  grunt.registerTask('build', ['meetup', 'sprite-members','jekyll:build']);
  grunt.registerTask('sprite-members', ['downloadmemberphotos','sprite', 'clean:members']);
  grunt.registerTask('optimize', ['cssmin','uncss','imagemin','uglify','htmlmin']);
  grunt.registerTask('deploy', ['build','optimize','buildcontrol']);
  grunt.registerTask('default', ['build','jekyll:serve']);

};
