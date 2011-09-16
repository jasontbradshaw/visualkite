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
        // get a larger pic than the default profile pic
        var pic_url = tweet.user.profile_image_url
                .replace("normal", "reasonably_small");

        // build the dom tweet item
        var item = dom("div", "item");
        var pic = dom("div", "pic").css("background-image",
                "url('" + pic_url + "')");
        var rightContent = dom("div", "right-content");
        var author = dom("div", "author");
        var screenName = dom("span", "screen-name").text(tweet.user.screen_name);
        var authorName = dom("span", "author-name").text(tweet.user.name);
        var text = dom("div", "text").text(tweet.text);

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
            //$(".stream .item:lt(" + (overflowLength+1) + ")").remove();
            $(".stream .item:lt(" + (overflowLength+1) + ")").slideUp("slow", function() { $(this).remove(); $(".stream").append(item);
} );
            //$(".stream .item:lt(" + (overflowLength+1) + ")").slideUp("slow");
            //$('.item').filter(function(index){return index == 0;}).slideUp("slow");
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

    // start the whole beast in motion
    getTweets();
});
