// Jasmine specs.

describe("Carousel", function () {
  var carousel;

  beforeEach(function () {
    carousel = new Carousel();
  });

  describe("length", function () {
    it("should be empty when nothing is pushed", function () {
      expect(carousel.length()).toEqual(0);
    });
  });

  describe("next", function () {
    it("should return null when empty", function () {
      expect(carousel.next()).toBeUndefined();
    });

    describe("with items in upcoming queue", function () {
      beforeEach(function () {
        carousel.push({'id': 1});
        carousel.push({'id': 2});
        carousel._pushToHistory({'id': 3});
      });

      it("should carousel right order", function () {
        expect(carousel.next()).toEqual({'id': 1});
        expect(carousel.next()).toEqual({'id': 2});
        expect(carousel.next()).toEqual({'id': 3});

        // upcoming: []
        // history:  [1, 2, 3]

        // Once more!
        expect(carousel.next()).toEqual({'id': 1});
        expect(carousel.next()).toEqual({'id': 2});
        expect(carousel.next()).toEqual({'id': 3});

        carousel.push({'id': 4});

        // upcoming: [4]
        // history:  [1, 2, 3]

        expect(carousel.next()).toEqual({'id': 4});
        expect(carousel.next()).toEqual({'id': 1});
        expect(carousel.next()).toEqual({'id': 2});
        carousel.push({'id': 5});
        expect(carousel.next()).toEqual({'id': 5});
        expect(carousel.next()).toEqual({'id': 3});
        expect(carousel.next()).toEqual({'id': 4});

        // upcoming: []
        // history:  [1, 2, 5, 3, 4]

        // Everyone now!
        expect(carousel.next()).toEqual({'id': 1});
        expect(carousel.next()).toEqual({'id': 2});
        expect(carousel.next()).toEqual({'id': 5});
        expect(carousel.next()).toEqual({'id': 3});
        expect(carousel.next()).toEqual({'id': 4});
      });
    });
  });
});
