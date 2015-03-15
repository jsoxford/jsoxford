(function(){
    var days = ['Sun','Mon','Tue','Wed','Thur','Fri','Sat'];
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    var pastEventsQuery = "https://api.meetup.com/2/events?format=json&group_id=17778422&photo-host=public&page=20&sig_id=153356042&fields=&limited_events=False&order=time&desc=true&status=past&sig=0b523c94134efcb38112a614a8e7ca68ed7a1930";
    var upcomingEventsQuery = "https://api.meetup.com/2/events?format=json&group_id=17778422&photo-host=public&page=20&sig_id=153356042&fields=&desc=false&limited_events=False&order=time&status=upcoming&sig=7409fe5da89084fb358c689e0d7ae98894b46908";
    var membersQuery = "https://api.meetup.com/2/members?format=json&group_id=17778422&only=photo%2Cname%2Clink&photo-host=public&page=200&order=name&sig_id=153356042&sig=a3af566e135bdd6c06a277d423bccd5740f1b145";

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

    function buildPost(event){
        var eventDate = new Date(event.time);
        var post = $('<div/>');
        var heading = $('<h2/>');
        var link = $('<a/>');
        var meetupImage = $('<img/>').attr('src','/img/meetup.png').attr('alt','Meetup');

        post.addClass('post');
        post.data('date', eventDate);
        heading.addClass('post-title');
        heading.append(meetupImage);
        link.attr('href', event.event_url);
        link.text(event.name);
        heading.append(link);
        heading.append(buildPostInfo(event));
        post.append(heading);
        post.append(event.description);

        return post;
    }
    function buildPostInfo(event){
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
        var going = $('<a/>').attr('href',event.event_url).text(event.yes_rsvp_count + ' going');
        var spots = $('<a/>').attr('href',event.event_url).text((event.rsvp_limit - event.yes_rsvp_count) + ' spots left');

        eventInfo.append(eventDate).append(eventTime).append(going).append(spots);
        return eventInfo;
    }
    function populateUpcomingEvents(){
        if(upcomingEvents.length > 0){
            $('#UpcomingEvents').empty();
            for(var i=0;i<upcomingEvents.length;i++){
                $('#UpcomingEvents').append(buildPost(upcomingEvents[i]));
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
                pastEventsArr.push(buildPost(pastEvents[i]));
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
