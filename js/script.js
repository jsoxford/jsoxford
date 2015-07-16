(function(){
    'use strict';

    var pastEventsQuery = "https://api.meetup.com/2/events?offset=0&format=json&limited_events=False&group_id=17778422&only=time%2Cevent_url%2Cname%2Cdescription%2Cyes_rsvp_count%2Crsvp_limit&photo-host=secure&page=40&fields=&order=time&status=past&desc=false&sig_id=153356042&sig=7c33ad50321a70d19f843d60c0c2eaee08b67d09";
    var upcomingEventsQuery = "https://api.meetup.com/2/events?offset=0&format=json&limited_events=False&group_id=17778422&only=time%2Cevent_url%2Cname%2Cdescription%2Cyes_rsvp_count%2Crsvp_limit&photo-host=secure&page=20&fields=&order=time&desc=false&status=upcoming&sig_id=153356042&sig=84e9ac6ce37bdb3c00e4f82fe5a7ce798865fbe4";
    var membersQuery = "https://api.meetup.com/2/members?offset=0&format=json&group_id=17778422&only=photo%2Cname%2Clink&photo-host=secure&page=200&order=name&sig_id=153356042&sig=4d8e3265b4374b84aabb8efcc26eb8107a3ec81b";

    var maxEventsToShow = 10;

    var isSmall = window.matchMedia && window.matchMedia('(max-width: 600px)').matches;

    var members = [];

    // Get upcoming events
    $.ajax({
      url: upcomingEventsQuery + "&offset=0",
        type: "GET",
        cache: false,
        dataType: "jsonp",
        crossDomain: true,
        success: function(data){
            buildArrayOfEventElements(data.results, true);
        }
    });
    // Get past events
    $.ajax({
      url: pastEventsQuery + "&offset=0",
        type: "GET",
        cache: false,
        dataType: "jsonp",
        crossDomain: true,
        success: function(data){
            buildArrayOfEventElements(data.results, false);
        }
    });
    // Get members, but only for desktop (don't want to waste peoples money)
    function fetchMembers(url){
        $.ajax({
          url: url,
            type: "GET",
            cache: false,
            dataType: "jsonp",
            crossDomain: true,
            success: function(data){
                // Currently will only get the first 200(?)
                Array.prototype.push.apply(members, data.results);

                if(data.meta.next){
                    fetchMembers(data.meta.next);
                }else{
                    populateMembers();
                }
            }
        });
    }
    fetchMembers(membersQuery);

    function buildPost(event, isUpcoming){
        var eventDate = new Date(event.time);
        var post = $('<div/>');
        var heading = $('<h2/>');
        var link = $('<a/>');
        var meetupImage = $('<img/>').attr('src','/img/meetup.png').attr('alt','Meetup');
        var headingTitle = $('<div/>');

        post.addClass('post');
        post.data('date', eventDate.getFullYear()+"-"+(eventDate.getMonth()<9?"0":"")+(eventDate.getMonth()+1)+"-"+eventDate.getDate());
        heading.addClass('post-title row');
        headingTitle.addClass('col-xs-9');
        headingTitle.append(meetupImage);
        link.attr('href', event.event_url);
        link.text(event.name);
        headingTitle.append(link);
        heading.append(headingTitle);
        heading.append(buildPostInfo(event, isUpcoming));
        post.append(heading);
        post.append(event.description);

        return post;
    }
    function buildPostInfo(event, isUpcoming){
        var eventDateTime = new Date(event.time);
        var ampm = (eventDateTime.getHours() >= 12 ? 'PM' : 'AM');
        var eventInfo = $('<div/>').addClass('eventInfo col-xs-3');
        var eventDateString = eventDateTime.toDateString().split(' '); // ['Wed', 'Jul', '15', '2015']
        var eventMonth = eventDateString[1];
        var eventDay = eventDateString[0];

        var eventDate = $('<span/>')
            .addClass('eventDate')
            .text(
                eventDay + " " + eventMonth + " "+ eventDateTime.getDate() + " "
            );
        var eventTime = $('<span/>')
            .addClass('eventTime')
            .text(
                (eventDateTime.getHours() >= 12 ? eventDateTime.getHours()-12 : eventDateTime.getHours()) + ":"+ (eventDateTime.getMinutes()<10?"0":"") + eventDateTime.getMinutes() + " " + ampm
            );
        var goingText = (isUpcoming ? 'going' : 'went');
        var going = $('<a/>').attr('href',event.event_url).text(event.yes_rsvp_count + ' ' + goingText);
        eventInfo.append(eventDate).append(eventTime).append(going);
        if(isUpcoming){
            var spots = $('<a/>').attr('href',event.event_url).text((event.rsvp_limit - event.yes_rsvp_count) + ' spots left');
            eventInfo.append(spots);
        }

        return eventInfo;
    }

    var buildArrayOfEventElements = function (events, isUpcoming) {
        var eventElements = [];
        var outputTarget = isUpcoming ? '#UpcomingEvents' : '#PastEvents';

        if (!isUpcoming) {
            var $staticPosts = $('.post', outputTarget);
            if ($staticPosts.length) {
                $staticPosts.each(function () {
                    eventElements.push($(this));
                });
            }
        }
        if (events.length) {
            for (var current = 0; current < maxEventsToShow; current++) {
                if (undefined !== events[current]) {
                    var eventRendered = buildPost(events[current], isUpcoming);
                    eventElements.push(eventRendered);
                }
            }
        }
        // Sort the events by date
        eventElements = sortEvents(eventElements);
        // Trim to our limit for this set
        eventElements = eventElements.splice(0, maxEventsToShow);
        // Display them
        $(outputTarget).empty().append(eventElements);
    };
    var sortEvents = function (events) {
        var sortedEvents = events.sort(function (a, b) {
            // No dates, get out of here!
            if (!a.data('date') || !b.data('date')) return;

            var dateA = new Date(a.data('date').toString().split(' ')[0]);
            var dateB = new Date(b.data('date').toString().split(' ')[0]);
            return dateA === dateB ? 0 : (dateA < dateB ? 1 : -1);
        });
        return sortedEvents;
    }
    function populateMembers(){
        var membersArr = [];
        var otherMembers = 0;
        var mobileIndexes = [];
        var rand, i;
        if(!isSmall){
            for(i=0;i<members.length;i++){
                if(members[i].photo){
                    membersArr.push(
                        $('<a/>')
                            .addClass('memberThumbnail icon-thumb_' + members[i].photo.photo_id)
                            .attr('href', members[i].link)
                            .attr('title', members[i].name)
                    );
                } else {
                    otherMembers++;
                }
            }
        }else{
            for(i=0;i<15;i++){
                rand = Math.floor(Math.random() * members.length) + 1;
                while(mobileIndexes.indexOf(rand) >= 0 || !members[rand].photo){
                    rand = Math.floor(Math.random() * members.length) + 1;
                }
                mobileIndexes.push(rand);
                membersArr.push(
                    $('<a/>')
                        .addClass('memberThumbnail icon-thumb_' + members[rand].photo.photo_id)
                        .attr('href', members[rand].link)
                        .attr('title', members[rand].name)
                );
            }
            otherMembers = members.length - 15;
        }
        if(otherMembers){
            membersArr.push($('<a/>').attr('href','https://www.meetup.com/JSOxford/members').text("...plus others."));
        }
        $('#MeetupMembers').append(membersArr);
        $('#Members').removeClass('hidden').find('h3').prepend(members.length+' ');
    }
}());
