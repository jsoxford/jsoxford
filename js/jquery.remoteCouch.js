/**
 * Remote Couch jQuery plugin
 *
 * A rough implemention of the couchdb jquery plugin,
 * but that can talk to remote sites when cors is enabled
 *
 * Kevin Carmody @skinofstars - 2013
 *
 */
;(function( $ ) {
    $.remoteCouch = $.remoteCouch || {};

    var settings = {
      host  : 'http://localhost:5984/', // http://foo.iriscouch.com/
      db    : 'couchdb',
    };

    function _getData(args, cb) {
        var path;
        if (args.path.length > 0) {
            path = args.path;
        } else {
            path = settings.host + settings.db + '/' + args.path;
        }

        return $.ajax({
            url: path,
            type : 'GET',
            dataType : "JSONP",
            success: function(data) {
                cb(data);
            },
            error: function(data) {
                cb(data)
            }
        });
    };

    $.extend($.remoteCouch, {
        self: this,

        // sets up the plugin config
        config: function(args) {
            // err, wat?
            settings.host   = args.host || settings.host;
            settings.db     = args.db   || settings.db;
        },

        // returns database status object
        status: function() {
            return _getData({
                path: settings.host
            }, function(data){
                return data;
            });
        },

        // returns _view from the specified _design
        // you can specify a list of keys in the
        // options object to recieve only those keys.
        view: function(name, options) {
            var name = name.split('/');
            var options = options || {};
            var q;
            if (options["keys"]) {
                q = '?';
                for (var key in options.keys) {
                    (q == '?' ? '' : q += '&');
                    q += key + '=' +options.keys[key];
                }
            }

            return _getData({
                    path: settings.host + settings.db +
                        "/_design/" + name[0] +
                        "/_view/" + name[0] + q
                }, function(data) {
                    return data;
                }
            );
        },

        openDoc: function(docId, options) {
            return _getData({
                path: settings.host + settings.db + '/' + docId
            }, function(data){
                return data;
            })
        },

        // triggers a document event that data has updated
        longpoll: function(database, last_seq) {
            var url = settings.host + database + "/_changes?feed=longpoll";
            // If we don't have a sequence number, then see where we are up to.
            if (last_seq) {
                url = url + "&since=" + last_seq;
            }
            
            // OH GOD THE HORROR
            (function request(){
            
            $.ajax({
                type: "GET",
                url: url,
                dataType: 'jsonp',
                success: function(data) {
                    // Now we need to see what to do with the data.
                    if (data.results.length) {
                        $(document).trigger('longpoll-data', [settings.db, data.results]);
                        $(document).trigger('longpoll-data-' + settings.db, [data.results]);
                    }
                    // And set up the re-run of the fetch query.
                    $.remoteCouch.longpoll(database, data.last_seq);
                },
                error:request
            })
            
            })();
        },

        changes: function(database, last_seq) {
            var url = settings.host + database + "/_changes";
            // If we don't have a sequence number, then see where we are up to.
            if (last_seq) {
                url = url + "&since=" + last_seq;
            }
            return $.ajax({
                type: "GET",
                url: url,
                dataType: 'jsonp',
                success: function(data) {
                    return data;
                }
            })
        }


    });

})(jQuery);
