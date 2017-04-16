// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
(function() {
  'use strict';
  var allEventsQuery = 'https://api.meetup.com/2/events?offset=0&format=json&limited_events=False&group_id=17778422&photo-host=secure&page=100&fields=&order=time&status=past%2Cupcoming&desc=false&sig_id=153356042&sig=66887b77c34d304571d20465b10229ce582b7e02';
  var membersQuery = 'https://api.meetup.com/2/members?offset=0&format=json&group_id=17778422&only=photo%2Cname%2Clink&photo-host=secure&page=200&order=name&sig_id=153356042&sig=4d8e3265b4374b84aabb8efcc26eb8107a3ec81b';

  var maxEventsToShow = window.maxEventsToShow || 10;

  var isSmall = window.matchMedia && window.matchMedia('(max-width: 600px)').matches;

  var members = [];

  // Get members, but only for desktop (don't want to waste peoples money)
  function fetchMembers(url) {
    $.ajax({
      url: url,
      type: 'GET',
      cache: false,
      dataType: 'jsonp',
      crossDomain: true,
      success: function(data) {
        // Currently will only get the first 200(?)
        Array.prototype.push.apply(members, data.results);

        if (data.meta.next) {
          fetchMembers(data.meta.next);
        } else {
          populateMembers();
        }
      },
    });
  }

  fetchMembers(membersQuery);

  function populateMembers() {
    var membersArr = [];
    var otherMembers = 0;
    var mobileIndexes = [];
    var rand;
    var i;

    if (!isSmall) {
      for (i = 0; i < members.length; i++) {
        if (members[i].photo) {
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
    } else {
      for (i = 0; i < 15; i++) {
        rand = Math.floor(Math.random() * members.length) + 1;
        while (mobileIndexes.indexOf(rand) >= 0 || !members[rand].photo) {
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

    if (otherMembers) {
      membersArr.push($('<a/>').attr('href', 'https://www.meetup.com/JSOxford/members').text('...plus others.'));
    }

    $('#MeetupMembers').append(membersArr);
    $('#Members').removeClass('hidden').find('h3').prepend(members.length + ' ');
  }

  // Get events
  $.ajax({
    url: allEventsQuery + '&offset=0',
    type: 'GET',
    cache: false,
    dataType: 'jsonp',
    crossDomain: true,
    success: function(data) {
      updatePosts(data.results);
    },
  });

  // Emoji titles
  $('.post-title a').each(function (i, e) {
    var element = $(e);
    element.html(emojione.shortnameToUnicode(element.html()));
  })

  function formatDate(date) {
    var dateString = '';
    dateString += date.getFullYear() + '-';
    if (date.getMonth() + 1 < 10) {
      dateString += '0';
    }

    dateString += (date.getMonth() + 1);
    dateString += '-';
    dateString += date.getDate();
    return dateString;
  }

  function updatePosts(posts) {
    var eventElements = [];
    var yesterday = new Date(new Date() - 86400000);
    var i;
    var len;
    var postDate;
    for (i = 0,len = posts.length; i < len; i++) {
      if (posts[i].created > yesterday) {
        var eventRendered = buildPost(posts[i], true);
        eventElements.push(eventRendered);
      }

      if (posts[i].updated > yesterday) {
        postDate = new Date(posts[i].time);
        $('[data-date^=' + formatDate(postDate) + ']').has('.meetupIcon').each(function()
        {
          var eventDateTime = new Date(posts[i].time);
          var ampm = (eventDateTime.getHours() >= 12 ? 'PM' : 'AM');
          var eventDateString = eventDateTime.toDateString().split(' '); // ['Wed', 'Jul', '15', '2015']
          var eventMonth = eventDateString[1];
          var eventDay = eventDateString[0];
          $(this).find('.title').text(posts[i].name);
          $(this).find('.postContent').html(posts[i].description);
          $(this).find('.attendees').text(posts[i].yes_rsvp_count);
          $(this).find('.eventDate').text(eventDay + ' ' + eventMonth + ' ' + eventDateTime.getDate() + ' ');
          $(this).find('.eventTime').text((eventDateTime.getHours() >= 12 ? eventDateTime.getHours() - 12 : eventDateTime.getHours()) + ':' + (eventDateTime.getMinutes() < 10 ? '0' : '') + eventDateTime.getMinutes() + ' ' + ampm);
        });
      }
    }

    // Sort the events by date
    eventElements = sortEvents(eventElements);

    // Display them
    $('#UpcomingEvents').append(eventElements);
  }

  function buildPost(event, isUpcoming) {
    var eventDate = new Date(event.time);
    var post = $('<div/>');
    var heading = $('<h2/>');
    var link = $('<a/>');
    var meetupImage = $('<img/>').attr('src', '/img/meetup.png').attr('alt', 'Meetup');
    var headingTitle = $('<div/>');

    post.addClass('post');
    post.data('date', eventDate.getFullYear() + '-' + (eventDate.getMonth() < 9 ? '0' : '') + (eventDate.getMonth() + 1) + '-' + eventDate.getDate());
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

  function buildPostInfo(event, isUpcoming) {
    var eventDateTime = new Date(event.time);
    var ampm = (eventDateTime.getHours() >= 12 ? 'PM' : 'AM');
    var eventInfo = $('<div/>').addClass('eventInfo col-xs-3');
    var eventDateString = eventDateTime.toDateString().split(' '); // ['Wed', 'Jul', '15', '2015']
    var eventMonth = eventDateString[1];
    var eventDay = eventDateString[0];

    var eventDate = $('<span/>')
      .addClass('eventDate')
      .text(
        eventDay + ' ' + eventMonth + ' ' + eventDateTime.getDate() + ' '
      );
    var eventTime = $('<span/>')
      .addClass('eventTime')
      .text(
        (eventDateTime.getHours() >= 12 ? eventDateTime.getHours() - 12 : eventDateTime.getHours()) + ':' + (eventDateTime.getMinutes() < 10 ? '0' : '') + eventDateTime.getMinutes() + ' ' + ampm
      );
    var goingText = (isUpcoming ? 'going' : 'went');
    var going = $('<a/>').attr('href', event.event_url).text(event.yes_rsvp_count + ' ' + goingText);
    eventInfo.append(eventDate).append(eventTime).append(going);
    if (isUpcoming) {
      var spots = $('<a/>').attr('href', event.event_url).text((event.rsvp_limit - event.yes_rsvp_count) + ' spots left');
      eventInfo.append(spots);
    }

    return eventInfo;
  }

  function sortEvents(events) {
    var sortedEvents = events.sort(function(a, b) {
      // No dates, get out of here!
      if (!a.data('date') || !b.data('date')) return;

      var dateA = new Date(a.data('date').toString().split(' ')[0]);
      var dateB = new Date(b.data('date').toString().split(' ')[0]);
      return dateA === dateB ? 0 : (dateA < dateB ? 1 : -1);
    });

    return sortedEvents;
  }
}());
