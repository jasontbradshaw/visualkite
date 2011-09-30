$(function () {
    var visKite = {sinceId: '?', getTweetsTimeoutId: ''};

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

    ////////////
    // Tweets //
    ////////////

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

    ///////////
    // Promo //
    ///////////

    var pushPromo = function (tweet) {
        // build the dom promo item
        var promoItem = dom("div", "promoItem");
        var rightContent = dom("div", "right-content");
        var text = dom("div", "text").text(tweet.text);

        // add all the elements where they're supposed to go
        promoItem.append(rightContent);
        rightContent.append(text);


        // slide box down
        $(".promo").slideToggle("slow", function() {

            // if promoItem exists, delete before inserting
            if ($(".promo .promoItem").length == 1) {
                $(".promo .promoItem:lt(" + (1) + ")").fadeOut("slow", function() {
                    $(this).remove();
                    $(".promo").append(promoItem);
                });
            } else {
                $(".promo").append(promoItem);
            }

            // slide box up
            $(".promo").slideToggle("slow");
        });
    };

    var receivePromo = function (tweets) {
        $.each(tweets, function(i, tweet) {
            pushPromo(tweet);
            if(i == 0) {
                visKite.sinceId = tweet.order_id;
            }
        });
    }

    var getPromo = function () {
        // TODO: what refresh rate do we want
        visKite.getPromoTimeoutId = setTimeout(getPromo, 60000);
        // TODO: change address to that of specific company
        $.getJSON("http://tweetriver.com/massrelevance/glee.json?&callback=?",
                {limit: 1, since_id: visKite.sinceId}, receivePromo);
    };

    /////////
    // Run //
    /////////

    // create promo area
    var promo = dom("div", "promo");
    $("body").append(promo);

    // begin getting tweets and promos
    getTweets();
    getPromo();

});
