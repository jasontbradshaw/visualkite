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

    var pushTweet = function (tweet) {
        var item = dom("div", "item");
        var pic = dom("div", "pic").css("background-image",
                "url('" + tweet.user.profile_image_url + "')");
        var rightContent = dom("div", "right-content");
        var author = dom("div", "author");
        var screenName = dom("span", "screen-name").text(tweet.user.screen_name);
        var authorName = dom("span", "author-name").text(tweet.user.name);
        var text = dom("div", "text").text(tweet.text);

        // add all the items where they're supposed to go
        item.append(pic);
        item.append(rightContent);
        rightContent.append(author);
        author.append(screenName);
        author.append(authorName);
        rightContent.append(text);

        // Delete before inserting.
        var overflowLength = $(".stream .item").length - 3;
        if(overflowLength >= 0) {
            $(".stream .item:lt(" + (overflowLength+1) + ")").remove();
        }

        $(".stream").append(item);
    };

    var pushTweet2 = function (tweet) {
        var html = $('\
                <div class="item">\
                <div class="pic"><img></div>\
                <div class="right-content">\
                <div class="author"><span class="screen-name"></span> <span class="name"></span></div>\
                <div class="text">\
                </div>\
                </div>\
                </div>');

        html.select(".author .screen-name").first().html(tweet.user.screen_name);
        //html.select(".author .name").first().html(tweet.user.name);
        //html.select(".text").first().html(tweet.text);

        $(".stream").append(html);
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

    // start the whole beast in motion
    getTweets();
});
