describe("StoredQueue", function () {
    var queue;

    beforeEach(function () {
        window.localStorage.clear();
        queue = new StoredQueue("myqueue", {clearExistingData: true});
    });

    describe("queue", function () {
        // Needed to clear the previous queue in beforeEach
        beforeEach(function () {
            window.localStorage.clear();
        });
        it("should be initialized when clearing data", function () {
            queue = new StoredQueue("myqueue", {clearExistingData: true});
            expect(queue.queue()).toEqual([]);
        });

        it("should be initialized when using old data", function () {
            queue = new StoredQueue("myqueue", {clearExistingData: false});
            expect(queue.queue()).toEqual([]);
        });
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

    describe("clear", function () {
        it("should clear", function () {
            queue.push({});
            queue.clear();
            expect(queue.length()).toEqual(0);
            expect(queue.pop()).toEqual(undefined);
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

        it("should use clear existing local storage if clearExistingData", function () {
            queue = new StoredQueue("myqueue", {clearExistingData: true});
            expect(queue.length()).toEqual(0);
            expect(queue.pop()).toEqual(undefined);
        });
    });
});

