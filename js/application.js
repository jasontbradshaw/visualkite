$(function () {
    var visKite = {sinceId: '?', getTweetsTimeoutId: ''};
    window.localStorage.setItem('tweets', JSON.stringify([{"coordinates":null,"favorited":false,"truncated":false,"created_at":"Wed Sep 21 01:14:37 +0000 2011","id_str":"116319388340207616","in_reply_to_user_id_str":null,"entities":{"urls":[],"hashtags":[],"user_mentions":[]},"entity_id":"116319388340207616","order_id":"116319388340207616","text":"AHH. I have so missed Glee.","contributors":null,"in_reply_to_status_id_str":null,"retweet_count":0,"id":116319388340207616,"geo":null,"retweeted":false,"in_reply_to_user_id":null,"in_reply_to_screen_name":null,"user":{"profile_sidebar_border_color":"181A1E","profile_background_tile":true,"profile_sidebar_fill_color":"252429","name":"Kristen Hall","profile_image_url":"http://a0.twimg.com/profile_images/1201159742/Photo_350_normal.jpg","location":"Muncie","created_at":"Thu Feb 11 00:16:29 +0000 2010","is_translator":false,"follow_request_sent":null,"id_str":"113184808","profile_link_color":"2FC2EF","contributors_enabled":false,"url":"http://thebeautydiaries-quehall.blogspot.com","favourites_count":15,"default_profile":false,"profile_image_url_https":"https://si0.twimg.com/profile_images/1201159742/Photo_350_normal.jpg","utc_offset":-21600,"id":113184808,"listed_count":1,"profile_use_background_image":true,"profile_text_color":"666666","followers_count":141,"lang":"en","protected":false,"notifications":null,"profile_background_color":"1A1B1F","time_zone":"Central Time (US & Canada)","verified":false,"description":"Self-diagnosed Beauty Addict; Amateur Foodie; Professional Cat Snuggler; Social Networking Extraordinaire.","profile_background_image_url_https":"https://si0.twimg.com/profile_background_images/235390821/241-CharcoalDamask.jpg","geo_enabled":true,"default_profile_image":false,"statuses_count":6737,"profile_background_image_url":"http://a1.twimg.com/profile_background_images/235390821/241-CharcoalDamask.jpg","friends_count":245,"following":null,"show_all_inline_media":true,"screen_name":"que_hall"},"source":"<a href=\"http://www.tweetdeck.com\" rel=\"nofollow\">TweetDeck</a>","place":null,"score":"116319388340207616","in_reply_to_status_id":null}]));

    // create a DOM element with optional class and id
    var dom = function (elementName, clazz, id) {
        var newElement = $("<" + elementName + "></" + elementName + ">");

        // add the class if present
        if (clazz !== undefined && clazz !== null && clazz !== "") {
            newElement.addClass(clazz);
        }

        // add the id if present
        if (id !== undefined && id !== null && id !== "") {
            newElement.attr("id", id);
        }

        return newElement;
    };

    var pushTweet = function (tweet) {
        // get a larger pic than the default profile pic
        var picUrl = tweet.user.profile_image_url
                .replace("normal", "reasonably_small");

        // build the dom tweet item
        var item = dom("div", "item");
        var pic = dom("canvas", "pic");
        var rightContent = dom("div", "right-content");
        var author = dom("div", "author");
        var screenName = dom("span", "screen-name").text(tweet.user.screen_name);
        var authorName = dom("span", "author-name").text(tweet.user.name);
        var text = dom("div", "text").text(tweet.text);

        // draw the profile image onto the pic canvas (prevents gif animations)
        var profilePic = new Image();
        profilePic.src = picUrl;
        var picContext = pic[0].getContext("2d");
        profilePic.onload = function () {
            picContext.drawImage(profilePic, 0, 0, 400, 200);
        };

        // add all the elements where they're supposed to go
        item.append(pic);
        item.append(rightContent);
        rightContent.append(author);
        author.append(screenName);
        author.append(authorName);
        rightContent.append(text);

        // delete before inserting
        var overflowLength = $(".stream .item").length - 3;
        if(overflowLength >= 0) {
            $(".stream .item:lt(" + (overflowLength+1) + ")").slideUp("slow", function() {
                $(this).remove();
                $(".stream").append(item);
            });
        } else {
            $(".stream").append(item);
        }
    };

    var receiveTweets = function (tweets) {
        $.each(tweets, function(i, tweet) {
            pushTweet(tweet);
            if(i == 0) {
                visKite.sinceId = tweet.order_id;
            }
        });
    };

    var getTweets = function () {
        // TODO: need to bump limit 3, and use a queue instead.
        visKite.getTweetsTimeoutId = setTimeout(getTweets, 3000);
        $.getJSON("http://tweetriver.com/massrelevance/glee.json?&callback=?",
                {limit: 3, since_id: visKite.sinceId}, receiveTweets);
    };

    var injectOldTweets = function () {
        pushTweet(JSON.parse(window.localStorage['tweets'])[0]);
    };

    injectOldTweets();
    
    // start the whole beast in motion
    getTweets();
});
