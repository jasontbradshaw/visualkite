// Jasmine specs.

describe("Carousel", function () {
    var carousel;

    beforeEach(function () {
        window.localStorage.clear();
        carousel = new Carousel({clearExistingData: true});
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

            it("should carousel in the right order", function () {
                expect(carousel.lengthUpcoming()).toEqual(2);
                expect(carousel.lengthHistory()).toEqual(1);

                expect(carousel.next()).toEqual({'id': 1});
                expect(carousel.next()).toEqual({'id': 2});
                expect(carousel.next()).toEqual({'id': 3});

                expect(carousel.lengthUpcoming()).toEqual(0);
                expect(carousel.lengthHistory()).toEqual(3);

                // upcoming: []
                // history:  [1, 2, 3]

                // Once more!
                expect(carousel.next()).toEqual({'id': 1});
                expect(carousel.next()).toEqual({'id': 2});
                expect(carousel.next()).toEqual({'id': 3});

                carousel.push({'id': 4});

                expect(carousel.lengthUpcoming()).toEqual(1);
                expect(carousel.lengthHistory()).toEqual(3);

                // upcoming: [4]
                // history:  [1, 2, 3]

                expect(carousel.next()).toEqual({'id': 4});
                expect(carousel.next()).toEqual({'id': 1});
                expect(carousel.next()).toEqual({'id': 2});
                carousel.push({'id': 5});
                expect(carousel.next()).toEqual({'id': 5});
                expect(carousel.next()).toEqual({'id': 3});
                expect(carousel.next()).toEqual({'id': 4});

                expect(carousel.lengthUpcoming()).toEqual(0);
                expect(carousel.lengthHistory()).toEqual(5);

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

    describe("trim", function () {
        it("should trim history elements first", function () {
            for(var i = 0; i < 4; ++i) {
                carousel.push({id: i});
            }

            // upcoming: [0, 1, 2, 3], history: []
            carousel.next(); // upcoming: [1, 2, 3], history: [0]
            carousel.next(); // upcoming: [2, 3], history: [0, 1]

            expect(carousel.lengthUpcoming()).toEqual(2);
            expect(carousel.lengthHistory()).toEqual(2);

            carousel.trim(1); // upcoming: [3], history: []

            expect(carousel.lengthUpcoming()).toEqual(1);
            expect(carousel.lengthHistory()).toEqual(0);
            expect(carousel.length()).toEqual(1);
            expect(carousel.next()).toEqual({id: 3});
        });
    });

    describe("clear", function () {
        it("should clear", function () {
            for(var i = 0; i < 3; ++i) {
                carousel.push({id: i});
            }

            expect(carousel.length()).toEqual(3);

            carousel.next(); // upcoming: [1, 2]  history: [0]
            carousel.clear();

            expect(carousel.length()).toEqual(0);
            expect(carousel.next()).toEqual(undefined);
        });
    });

    describe("with bounded length", function () {
        var max = 3;
        beforeEach(function () {
            carousel = new Carousel({max: max, clearExistingData: true});
        });

        it("should not excede max count", function () {
            for(var i = 0; i < 2*max; ++i) {
                carousel.push({id: i});
            }
            expect(carousel.length()).toEqual(3);
        });

        // TODO
        xit("should delete from history first", function () {
        });
    });
});

