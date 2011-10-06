describe("Queue", function () {
    var queue;

    beforeEach(function () {
        queue = new Queue();
    });

    describe("length", function () {
        it("should be zero if empty", function () {
            expect(queue.length).toEqual(0);
        });

        it("should be the right size", function () {
            queue.enqueue({id: 1});
            queue.enqueue({id: 2});
            expect(queue.length).toEqual(2);
        });
    });

    describe("isEmpty", function () {
        it("should be true when empty", function () {
            expect(queue.isEmpty()).toBeTruthy();

            queue.enqueue({});
            queue.dequeue();
            expect(queue.isEmpty()).toBeTruthy();
        });

        it("should be false when not empty", function () {
            queue.enqueue("");
            expect(queue.isEmpty()).toBeFalsy();
        });
    });

    describe("dequeue", function () {
        it("should return undefined if queue is empty", function () {
            expect(queue.dequeue()).toEqual(undefined);
            expect(queue.length).toEqual(0);
        });

        it("should return in FIFO order", function () {
            queue.enqueue({id: 1});
            queue.enqueue({id: 2});
            expect(queue.dequeue()).toEqual({id: 1});
            expect(queue.dequeue()).toEqual({id: 2});
        });
    });

    describe("enqueue", function () {
        it("should enqueue a lot of types", function () {
            queue.enqueue(undefined);
            queue.enqueue(null);
            queue.enqueue("");
            queue.enqueue({a: [1, 2, {b: 3}]});
            queue.enqueue(undefined);

            expect(queue.dequeue()).toEqual(undefined);
            expect(queue.dequeue()).toEqual(null);
            expect(queue.dequeue()).toEqual("");
            expect(queue.dequeue()).toEqual({a: [1, 2, {b: 3}]});
            expect(queue.dequeue()).toEqual(undefined);
            expect(queue.length).toEqual(0);
            expect(queue.dequeue()).toEqual(undefined);
            expect(queue.length).toEqual(0);
        });

        it("should chain queues", function () {
            queue.enqueue({a: [1, 2, {b: 3}]}).enqueue(3);
            expect(queue.dequeue()).toEqual({a: [1, 2, {b: 3}]});
            expect(queue.dequeue()).toEqual(3);
        });
    });

    describe("clear", function () {
        it("should clear", function () {
            queue.enqueue({});
            queue.clear();
            expect(queue.length).toEqual(0);
            expect(queue.dequeue()).toEqual(undefined);
        });
    });
});

