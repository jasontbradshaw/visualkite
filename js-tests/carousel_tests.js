$(document).ready(function(){
  var carousel = new Carousel();

  module("Empty carousel");

  test("length is zero", function () {
    equal(carousel.length(), 0);
  });

  test("next returns null", function () {
    equal(carousel.next(), null);
  });

  module("Non-empty carousel");

  test("push increases length", function () {
    equal(carousel.length(), 0);
    carousel.push({});
    equal(carousel.length(), 1);
  });
});
