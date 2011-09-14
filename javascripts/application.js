function pushTweet(tweet) {

  var html = '<div class="item">';
  html += '<div class="pic"><img src="' + tweet["user"]["profile_image_url"] + '"></div>';
  html += '<div class="right-content">';
  html += '<div class="author">';
  html += tweet["user"]["screen_name"] + ' <span class="author-name">' + tweet["user"]["name"] + '</span></div>';
  html += '<div class="text">' + tweet["text"] + '</div>';
  html += '</div>';
  html += '</div>';
  html += '</div>';
  html += '</div>';

  $(".stream").append(html);
}

function receiveTweets(tweets) {
  $.each(tweets, function(i, tweet) {
    pushTweet(tweet);
  });
}
