// Jasmine specs.

describe("Carousel", function () {
  var carousel;

  beforeEach(function () {
    carousel = new Carousel({useExistingData: false});
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

  describe("trim", function () {
    it("should trim history elements first", function () {
      for(var i = 0; i < 3; ++i) {
        carousel.push({id: i});
      }

      carousel.next(); // upcoming: [1, 2], history: [0]
      carousel.trim(1);

      expect(carousel.length()).toEqual(1);
      expect(carousel.next()).toEqual({id: 2});
    });

    it("should trim earliest-pushed elements first", function () {
      for(var i = 0; i < 3; ++i) {
        carousel.push({id: i});
      }

      carousel.next(); // upcoming: [1, 2]  history: [0]
      carousel.next(); // upcoming:    [2]  history: [0, 1]
      carousel.next(); // upcoming:     []  history: [0, 1, 2]
      carousel.next(); // upcoming:     []  history: [1, 2, 0]
      carousel.trim(1);

      expect(carousel.length()).toEqual(1);
      // TODO this will fail because time-sensitive trimming is not implemented.
      expect(carousel.next()).toEqual({id: 2});
    });
  });

  describe("with bounded length", function () {
    var max = 3;
    beforeEach(function () {
      carousel = new Carousel({max: max, useExistingData: false});
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

describe("StoredQueue", function () {
  var queue;

  beforeEach(function () {
    queue = new StoredQueue("myqueue", {useExistingData: false});
  });

  describe("length", function () {
    it("should be zero if empty", function () {
      expect(queue.length()).toEqual(0);
    });

    it("should be the right size", function () {
      queue.push({id: 1});
      queue.push({id: 2});
      expect(queue.length()).toEqual(2);
    });
  });

  describe("isEmpty", function () {
    it("should be true when empty", function () {
      expect(queue.isEmpty()).toBeTruthy();

      queue.push({});
      queue.pop();
      expect(queue.isEmpty()).toBeTruthy();
    });

    it("should be false when not empty", function () {
      queue.push("");
      expect(queue.isEmpty()).toBeFalsy();
    });
  });

  describe("pop", function () {
    it("should return undefined if queue is empty", function () {
      expect(queue.pop()).toEqual(undefined);
      expect(queue.length()).toEqual(0);
    });

    it("should return in FIFO order", function () {
      queue.push({id: 1});
      queue.push({id: 2});
      expect(queue.pop()).toEqual({id: 1});
      expect(queue.pop()).toEqual({id: 2});
    });
  });

  describe("push", function () {
    it("should push a lot of types", function () {
      queue.push(undefined);
      queue.push(null);
      queue.push("");
      queue.push({a: [1, 2, {b: 3}]});
      queue.push(undefined);

      expect(queue.pop()).toEqual(undefined);
      expect(queue.pop()).toEqual(null);
      expect(queue.pop()).toEqual("");
      expect(queue.pop()).toEqual({a: [1, 2, {b: 3}]});
      expect(queue.pop()).toEqual(undefined);
      expect(queue.length()).toEqual(0);
      expect(queue.pop()).toEqual(undefined);
      expect(queue.length()).toEqual(0);
    });
  });

  describe("using old data", function () {
    beforeEach(function () {
      queue.push({id: 1});
      queue.push({id: 10});
    });

    it("should use existing local storage by default", function () {
      queue = new StoredQueue("myqueue", {max: 3});
      expect(queue.length()).toEqual(2);
      expect(queue.pop()).toEqual({id: 1});
      expect(queue.pop()).toEqual({id: 10});
      expect(queue.pop()).toEqual(undefined);
    });

    it("should use clear existing local storage if not useExistingData", function () {
      queue = new StoredQueue("myqueue", {useExistingData: false});
      expect(queue.length()).toEqual(0);
      expect(queue.pop()).toEqual(undefined);
    });
  });
});

describe("LocalStorage", function () {
  var storage;

  beforeEach(function () {
    storage = new LocalStorage('my.test', {useExistingData: false});
  });

  afterEach(function () {
    storage.clear();
  });

  describe("_key", function () {
    it("should build key properly", function () {
      expect(storage._key('myattribute')).toEqual('LocalStorage.my.test.myattribute');
      expect(storage._key('')).toEqual('LocalStorage.my.test');
      expect(storage._key(null)).toEqual('LocalStorage.my.test');
      expect(storage._key(undefined)).toEqual('LocalStorage.my.test');
      expect(storage._key()).toEqual('LocalStorage.my.test');
    });
  });

  describe("get", function () {
    it("should return undefined if attribute does not exist", function () {
      expect(storage.get('myattribute')).toEqual(undefined);
    });

    it("should return value if it exists", function () {
      storage.set('myattribute', 'my data');
      expect(storage.get('myattribute')).toEqual("my data");
    });

    it("should return value as a string", function () {
      storage.set('myattribute', {id: 32});
      expect(storage.get('myattribute')).toEqual('{"id":32}');
    });
  });

  describe("json", function () {
    it("should return undefined if attribute does not exist", function () {
      expect(storage.json('myattribute')).toEqual(undefined);
    });

    it("should return as JSON", function () {
      storage.set('myattribute', {id: 32, names: ['elben', 'jason', 'paul']});
      expect(storage.json('myattribute')).toEqual({id :32, names: ['elben', 'jason', 'paul']});
    });

    it("should return as array", function () {
      storage.set('myattribute', ['yep', 32]);
      expect(storage.json('myattribute')).toEqual(['yep', 32]);
    });
  });

  describe("int", function () {
    it("should return undefined if attribute does not exist", function () {
      expect(storage.json('myattribute')).toEqual(undefined);
    });

    it("should return as int", function () {
      storage.set('myattribute', 32);
      expect(storage.int('myattribute')).toEqual(32);
    });
  });

  describe("incr", function () {
    it("should return undefined if attribute does not exist", function () {
      expect(storage.json('myattribute')).toEqual(undefined);
    });
    it("should increment floats", function () {
      storage.set('myattribute', 32.2);
      expect(storage.incr('myattribute')).toEqual(33.2);
      expect(storage.get('myattribute')).toEqual('33.2');
    });

    it("should increment integers", function () {
      storage.set('myattribute', 32);
      expect(storage.incr('myattribute')).toEqual(33);
      expect(storage.get('myattribute')).toEqual('33');
    });
  });
});
