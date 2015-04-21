(function(){
    var allEventsQuery = "https://api.meetup.com/2/events?offset=0&format=json&limited_events=False&group_id=17778422&photo-host=secure&page=100&fields=&order=time&status=past%2Cupcoming&desc=false&sig_id=153356042&sig=66887b77c34d304571d20465b10229ce582b7e02";
    var membersQuery = "https://api.meetup.com/2/members?offset=0&format=json&group_id=17778422&only=photo%2Cname%2Clink&photo-host=secure&page=200&order=name&sig_id=153356042&sig=4d8e3265b4374b84aabb8efcc26eb8107a3ec81b";
    var isSmall = window.matchMedia && window.matchMedia('(max-width: 600px)').matches
    var members = [];


    // Get events
    $.ajax({
      url: allEventsQuery + "&offset=0",
        type: "GET",
        cache: false,
        dataType: "jsonp",
        crossDomain: true,
        success: function(data){
            updatePosts(data.results);            
        }
    });

    function formatDate(date){
      var dateString = '';
      dateString += date.getFullYear()+'-';
      if(date.getMonth()+1<10){
        dateString += '0';
      }
      dateString += (date.getMonth()+1);     
      dateString += '-';
      dateString += date.getDate();
      return dateString;
    }

    function updatePosts(posts){
        var yesterday = new Date(new Date() - 86400000);
        var i,len,postDate;
        for(i=0,len=posts.length;i<len;i++){
            if(posts[i].updated > yesterday){
                postDate = new Date(posts[i].time);
                $('[data-date^='+formatDate(postDate)+']').has('.meetupIcon').each(function(){
                    $(this).find('.title').text(posts[i].name);
                    $(this).find('.postContent').html(posts[i].description);
                    $(this).find('.attendees').text(posts[i].yes_rsvp_count);
                });
            }
        }
    }

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
                            .addClass('memberThumbnail')
                            .attr('href', members[i].link)
                            .attr('title', members[i].name)
                            .css('background-image', 'url('+members[i].photo.thumb_link+')')
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
                        .addClass('memberThumbnail')
                        .attr('href', members[rand].link)
                        .attr('title', members[rand].name)
                        .css('background-image', 'url('+members[rand].photo.thumb_link+')')
                );
            }
            otherMembers = members.length - 15;
        }
        if(otherMembers){
            membersArr.push($('<a/>').attr('href','https://www.meetup.com/JSOxford/members').text("...plus "+otherMembers+" others."));
        }
        $('#MeetupMembers').append(membersArr);
        $('#Members').removeClass('hidden').find('h3').prepend(members.length+' ');
    }
}());
