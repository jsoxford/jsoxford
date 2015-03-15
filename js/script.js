(function(){
    var days = ['Sun','Mon','Tue','Wed','Thur','Fri','Sat'];
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    var pastEventsQuery = "https://api.meetup.com/2/events?offset=0&format=json&limited_events=False&group_id=17778422&only=time%2Cevent_url%2Cname%2Cdescription%2Cyes_rsvp_count%2Crsvp_limit&photo-host=secure&page=40&fields=&order=time&status=past&desc=false&sig_id=153356042&sig=7c33ad50321a70d19f843d60c0c2eaee08b67d09";
    var upcomingEventsQuery = "https://api.meetup.com/2/events?offset=0&format=json&limited_events=False&group_id=17778422&only=time%2Cevent_url%2Cname%2Cdescription%2Cyes_rsvp_count%2Crsvp_limit&photo-host=secure&page=20&fields=&order=time&desc=false&status=upcoming&sig_id=153356042&sig=84e9ac6ce37bdb3c00e4f82fe5a7ce798865fbe4";
    var membersQuery = "https://api.meetup.com/2/members?offset=0&format=json&group_id=17778422&only=photo%2Cname%2Clink&photo-host=secure&page=200&order=name&sig_id=153356042&sig=4d8e3265b4374b84aabb8efcc26eb8107a3ec81b";

    var pastEvents = [],
        upcomingEvents = [],
        members = [],
        groupInfo = {};

    // Get upcoming events
    $.ajax({
      url: upcomingEventsQuery + "&offset=0",
        type: "GET",
        cache: false,
        dataType: "jsonp",
        crossDomain: true,
        success: function(data){
            // Currently will only get the first 20
            upcomingEvents = data.results;
            populateUpcomingEvents();
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
            // Currently will only get the first 20
            pastEvents = data.results;
            populatePastEvents();
        }
    });
    // Get members
    $.ajax({
      url: membersQuery + "&offset=0",
        type: "GET",
        cache: false,
        dataType: "jsonp",
        crossDomain: true,
        success: function(data){
            // Currently will only get the first 200(?)
            members = data.results;
            populateMembers();
        }
    });

    function buildPost(event, isUpcoming){
        var eventDate = new Date(event.time);
        var post = $('<div/>');
        var heading = $('<h2/>');
        var link = $('<a/>');
        var meetupImage = $('<img/>').attr('src','img/meetup.png').attr('alt','Meetup');

        post.addClass('post');
        post.data('date', eventDate);
        heading.addClass('post-title');
        heading.append(meetupImage);
        link.attr('href', event.event_url);
        link.text(event.name);
        heading.append(link);
        heading.append(buildPostInfo(event, isUpcoming));
        post.append(heading);
        post.append(event.description);

        return post;
    }
    function buildPostInfo(event, isUpcoming){
        var eventDateTime = new Date(event.time);
        var ampm = (eventDateTime.getHours() >= 12 ? 'PM' : 'AM');
        var eventInfo = $('<div/>').addClass('eventInfo');
        var eventDate = $('<span/>')
            .addClass('eventDate')
            .text(
                days[eventDateTime.getDay()] + " " + months[eventDateTime.getMonth()] + " "+ eventDateTime.getDate() + " "
            );
        var eventTime = $('<span/>')
            .addClass('eventTime')
            .text(
                (eventDateTime.getHours() >= 12 ? eventDateTime.getHours()-12 : eventDateTime.getHours()) + ":"+ eventDateTime.getMinutes() + " " + ampm
            );
        var goingText = (isUpcoming ? 'going' : 'went');
        var going = $('<a/>').attr('href',event.event_url).text(event.yes_rsvp_count + ' ' + goingText);
        eventInfo.append(eventDate).append(eventTime).append(going)
        if(isUpcoming){
            var spots = $('<a/>').attr('href',event.event_url).text((event.rsvp_limit - event.yes_rsvp_count) + ' spots left');
            eventInfo.append(spots);
        }

        return eventInfo;
    }
    function populateUpcomingEvents(){
        if(upcomingEvents.length > 0){
            $('#UpcomingEvents').empty();
            for(var i=0;i<upcomingEvents.length;i++){
                $('#UpcomingEvents').append(buildPost(upcomingEvents[i], true));
            }
        }
    }
    function populatePastEvents(){
        if(pastEvents.length > 0){
            var pastEventsArr = [];
            $('#PastEvents .post').each(function(){
                pastEventsArr.push($(this));
            });
            for(var i=0;i<pastEvents.length;i++){
                pastEventsArr.push(buildPost(pastEvents[i], false));
            }

            pastEventsArr.sort(function(a, b){
                var dateA = new Date(a.data('date'));
                var dateB = new Date(b.data('date'));
                return dateA === dateB ? 0 : (dateA < dateB ? 1 : -1);
            });
            $('#PastEvents').empty().append(pastEventsArr);
        }
    }
    function populateMembers(){
        var membersArr = [];
        var otherMembers = 0;
        for(var i=0;i<members.length;i++){
            if(members[i].photo){
                membersArr.push(
                    $('<a/>')
                        .addClass('memberThumbnail')
                        .attr('href', members[i].link)
                        .attr('title', members[i].name)
                        .css('background-image', 'url('+members[i].photo.thumb_link+')')
                );
            } else {
                otherMembers++;
            }
        }
        if(otherMembers){
            membersArr.push($('<a/>').attr('href','https://www.meetup.com/JSOxford/members').text("...plus "+otherMembers+" others."));
        }
        $('#MeetupMembers').append(membersArr);
        $('#Members').removeClass('hidden');
    }

}());
