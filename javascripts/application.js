visKite = {sinceId: '?', getTweetsTimeoutId: ''};

function pushTweet(tweet) {

  var html = '<div class="item">';
  html += '<div class="pic"><img src="' + tweet.user.profile_image_url + '"></div>';
  html += '<div class="right-content">';
  html += '<div class="author">';
  html += '<span class="screen-name">' + tweet.user.screen_name + '</span>';
  html += ' <span class="author-name">' + tweet.user.name + '</span></div>';
  html += '<div class="text">' + tweet.text + '</div>';
  html += '</div>';
  html += '</div>';
  html += '</div>';
  html += '</div>';

  // Delete before inserting.
  var overflowLength = $(".stream .item").length - 3;
  if(overflowLength >= 0) {
    $(".stream .item:lt(" + (overflowLength+1) + ")").remove();
  }

  $(".stream").append(html);
}

function pushTweet2(tweet) {
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
}


function receiveTweets(tweets) {
  $.each(tweets, function(i, tweet) {
    pushTweet(tweet);
    if(i == 0) {
      visKite.sinceId = tweet.order_id;
    }
  });
}

function getTweets() {
  // TODO: need to bump limit 3, and use a queue instead.
  visKite.getTweetsTimeoutId = setTimeout(getTweets, 3000);
  $.getJSON("http://tweetriver.com/massrelevance/glee.json?&callback=?",
      {limit: 3, since_id: visKite.sinceId}, receiveTweets);
}
