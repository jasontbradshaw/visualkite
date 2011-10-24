$(function () {
    var visKiteDefaults = {
        sinceId: '',
        maxItems: 2,
        rotateTimeout: 7000,
        getItemsTimeout: 1500,
        promoTimeout: 60000,
        rotateTimeoutId: 0,
        getItemsTimeoutId: 0,
        paused: false,
        promoEnabled: true
    };

    var visKite = deepCopy(visKiteDefaults);

    var carousel = new Carousel({max: 10});
    // TODO refactor how old tweets are initialized into carousel;wa
    carousel.push({"coordinates":null,"favorited":false,"truncated":false,"created_at":"Wed Sep 21 01:14:37 +0000 2011","id_str":"116319388340207616","in_reply_to_user_id_str":null,"entities":{"urls":[],"hashtags":[],"user_mentions":[]},"entity_id":"116319388340207616","order_id":"116319388340207616","text":"Studying at @dojocoffee. Mmmmmm coffee.","contributors":null,"in_reply_to_status_id_str":null,"retweet_count":0,"id":116319388340207616,"geo":null,"retweeted":false,"in_reply_to_user_id":null,"in_reply_to_screen_name":null,"user":{"profile_sidebar_border_color":"181A1E","profile_background_tile":true,"profile_sidebar_fill_color":"252429","name":"Kristen Hall","profile_image_url":"http://a0.twimg.com/profile_images/1201159742/Photo_350_normal.jpg","location":"Muncie","created_at":"Thu Feb 11 00:16:29 +0000 2010","is_translator":false,"follow_request_sent":null,"id_str":"113184808","profile_link_color":"2FC2EF","contributors_enabled":false,"url":"http://thebeautydiaries-quehall.blogspot.com","favourites_count":15,"default_profile":false,"profile_image_url_https":"https://si0.twimg.com/profile_images/1201159742/Photo_350_normal.jpg","utc_offset":-21600,"id":113184808,"listed_count":1,"profile_use_background_image":true,"profile_text_color":"666666","followers_count":141,"lang":"en","protected":false,"notifications":null,"profile_background_color":"1A1B1F","time_zone":"Central Time (US & Canada)","verified":false,"description":"Self-diagnosed Beauty Addict; Amateur Foodie; Professional Cat Snuggler; Social Networking Extraordinaire.","profile_background_image_url_https":"https://si0.twimg.com/profile_background_images/235390821/241-CharcoalDamask.jpg","geo_enabled":true,"default_profile_image":false,"statuses_count":6737,"profile_background_image_url":"http://a1.twimg.com/profile_background_images/235390821/241-CharcoalDamask.jpg","friends_count":245,"following":null,"show_all_inline_media":true,"screen_name":"que_hall"},"source":"<a href=\"http://www.tweetdeck.com\" rel=\"nofollow\">TweetDeck</a>","place":null,"score":"116319388340207616","in_reply_to_status_id":null});

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

    // direction can be 'down' or 'up'
    var insertToStream = function (item, direction) {
        if(direction == undefined) {
            direction = 'down';
        }

        if(direction == 'up') {
            // Stream goes up. Delete first, then insert.
            var overflowLength = $(".stream .item").length - visKite.maxItems;
            if (overflowLength >= 0) {
                $(".stream .item:lt(" + (overflowLength + 1) + ")")
                .slideUp("slow", function() {
                    $(this).remove();
                    $(".stream").append(item);
                });
            } else {
                $(".stream").append(item);
            }
        } else {
            // Stream goes down. Insert first, then delete.
            item.hide(); // so that it slides down nicely.
            $(".stream").prepend(item);
            $(".item:eq(0)").slideDown("slow");

            // asyncronously (to the insertion), delete overflow
            var overflowLength = $(".stream .item").length - visKite.maxItems;
            if (overflowLength >= 0) {
                $(".stream .item:gt(" + (visKite.maxItems - overflowLength) + ")").fadeOut('slow', function () { $(this).remove(); })
            }
        };
    }

    // create a tweet and add it to the display queue
    var renderTweet = function (tweet) {
        // get a larger pic than the default profile pic
        var picUrl = tweet.user.profile_image_url
        .replace("_normal", "_reasonably_small");

        // build the dom tweet item
        var item = dom("div", "item");
        var pic = dom("canvas", "pic");
        var rightContent = dom("div", "right-content");
        var author = dom("div", "author");
        var screenName = dom("span", "screen-name").text(tweet.user.screen_name);
        var authorName = dom("span", "author-name").text(tweet.user.name);
        var text = buildTweet(tweet.text);

        // add all the elements where they're supposed to go
        item.append(pic);
        item.append(rightContent);
        rightContent.append(author);
        author.append(screenName);
        author.append(authorName);
        rightContent.append(text);

        // draw the profile image onto the pic canvas (prevents gif animations)
        var profilePic = dom("img");
        profilePic.attr("src",picUrl);
        profilePic.load(function () {
            var canvas = pic[0].getContext("2d");
            canvas.drawImage(profilePic[0], 0, 0, 300, 150);

            // load the tweet item into the stream once its pic has been rendered
            insertToStream(item, 'down');
        });
    };

    ///////////
    // Promo //
    ///////////

    var renderPromo = function (tweets) {
        var tweet = tweets[0];
        var text = buildTweet(tweet.text);

        // if new tweet is same as current tweet, break
        var curText = $("div.promo-item").text();
        if (text.text() == curText) {
            return;
        }

        // build the dom promo item
        var promoItem = dom("div", "promo-item");
        var rightContent = dom("div", "right-content");

        // add all the elements where they're supposed to go
        promoItem.append(rightContent);
        rightContent.append(text);

        // box starts up (hidden)
        $(".promo").slideUp("fast", function() {

            // if promoItem exists, delete before inserting
            if ($(".promo .promo-item").length == 1) {
                $(".promo .promo-item").fadeOut("slow", function() {
                    $(this).remove();
                    $(".promo").append(promoItem);
                });
            } else {
                $(".promo").append(promoItem);
            }

            // slide box down
            $(".promo").slideDown("slow");
        });
    };

    var getPromo = function () {
        visKite.getPromoTimeoutId = setTimeout(getPromo, visKite.promoTimeout);

        if(!visKite.promoEnabled) {
            return;
        }

        $.getJSON("http://tweetriver.com/ElbenShira/dominican-joe-promo.json?&callback=?",
                  {limit: 1}, renderPromo);
    };

    // Push tweets into carousel.
    var pushTweets = function (tweets) {
        $.each(tweets, function(i, tweet) {
            carousel.push(tweet);
            if (i == 0) {
                visKite.sinceId = tweet.order_id;
            }
        });
    };

    // Pull new tweets every 3 seconds.
    var getTweets = function () {
        if(!visKite.paused) {
            visKite.getItemsTimeoutId = setTimeout(getTweets, visKite.getItemsTimeout);
        }
        $.getJSON("http://tweetriver.com/ElbenShira/dominican-joe.json?&callback=?",
                  {limit: 10, since_id: visKite.sinceId}, pushTweets);
    };

    // This rotates the carousel. Rotates every 3 seconds.
    var rotate = function () {
        if(!visKite.paused) {
            visKite.rotateTimeoutId = setTimeout(rotate, visKite.rotateTimeout);
        }
        renderTweet(carousel.next());
    };

    var setupDebugBar = function () {
        $("#debug-bar").mouseenter(function () {
            $("#debug-bar").addClass("mouseenter");
        });
        $("#debug-bar").mouseleave(function () {
            $("#debug-bar").removeClass("mouseenter");
        });
        $("#debug-pause-button").click(function () {
            if(visKite.paused == undefined) {
                visKite.paused = false;
            }

            if(visKite.paused) {
                // Resume!
                visKite.getItemsTimeoutId = setTimeout(rotate, visKite.rotateTimeout);
                visKite.getItemsTimeoutId = setTimeout(getTweets, visKite.getItemsTimeout);
                $("#debug-pause-button a").text("Pause");
            } else {
                // Pause!
                clearTimeout(visKite.getItemsTimeoutId);
                clearTimeout(visKite.rotateTimeoutId);
                $("#debug-pause-button a").text("Resume");
            }

            visKite.paused = !visKite.paused;
        });

        $("#debug-clear-carousel-button").click(function () {
            carousel.clear();
        });

        $("#debug-toggle-promo-button").click(function () {
            $(".promo").toggle();
            visKite.promoEnabled = !visKite.promoEnabled;
        });
    };

    var buildTweet = function (tweet_text) {
        var div = dom("div", "text");

        var tokens = tweet_text.split(' ');
        // TODO bug: multiple spaces will be thrown out
        // TODO: check for quotes
        $.each(tokens, function (i, token) {
            if(token.length > 1) { // we don't want stray '@' and '#'
                var textBody = token.substring(1, token.length); // for @ and #
                if(token[0] == "@") {
                    var href = "https://twitter.com/" + token.substring(1, token.length);
                    var at_sign = dom("span").addClass("mention-symbol").text("@");
                    var link = dom("a").attr("href", href).addClass("mention").text(textBody).prepend(at_sign);
                    div.append(link);
                } else if(token[0] == "#") {
                    var href = "https://twitter.com/#!/search?q=%23" + token.substring(1, token.length);
                    var hash_sign = dom("span").addClass("hashtag-symbol").text("#");
                    var link = dom("a").attr("href", href).addClass("hashtag").text(textBody).prepend(hash_sign);
                    div.append(link);
                } else {
                    div.append(token);
                }
                div.append(" ");
            } else {
                div.append(" " + token + " ");
            }
        });

        return div;
    };


    /////////
    // Run //
    /////////

    // create promo area
    var promo = dom("div", "promo");
    $("body").append(promo);

    getPromo();
    getTweets();
    renderTweet(carousel.next());
    renderTweet(carousel.next());
    rotate();
    setupDebugBar();
});

var shallowCopy = function (o) {
    return $.extend({}, o);
}

var deepCopy = function (o) {
    return $.extend(true, {}, o);
}
