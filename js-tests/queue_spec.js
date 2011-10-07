describe("Queue", function () {
    var queue;

    beforeEach(function () {
        queue = new Queue();
    });

    describe("length", function () {
        it("should be zero if empty", function () {
            expect(queue.length()).toEqual(0);
        });

        it("should be the right size", function () {
            queue.enqueue({id: 1});
            queue.enqueue({id: 2});
            expect(queue.length()).toEqual(2);
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
            expect(queue.length()).toEqual(0);
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
            expect(queue.length()).toEqual(0);
            expect(queue.dequeue()).toEqual(undefined);
            expect(queue.length()).toEqual(0);
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
            expect(queue.length()).toEqual(0);
            expect(queue.dequeue()).toEqual(undefined);
        });
    });

    describe("pointer reduction", function () {
        it("should shift pointers back to zero", function () {
            queue.enqueue(0);
            queue.enqueue(1);
            queue.enqueue(2);
            queue.dequeue();

            // reduce pointers as if 2 was the largest desired value
            queue.__getPrivateMembers__().reducePointers(2);

            expect(queue.__getPrivateMembers__().head).toEqual(0);
            expect(queue.__getPrivateMembers__().tail).toEqual(2);
        });

        it("should shift pointers to zero when emptied", function () {
            queue.enqueue(0);
            queue.enqueue(1);
            queue.enqueue(2);
            queue.dequeue();
            queue.dequeue();
            queue.dequeue();

            expect(queue.__getPrivateMembers__().head).toEqual(0);
            expect(queue.__getPrivateMembers__().tail).toEqual(0);
        });

        it("should not shift pointers when unneccesary", function () {
            queue.enqueue(0);
            queue.enqueue(1);
            queue.enqueue(2);

            // we try to shift even though we don't need to
            queue.__getPrivateMembers__().reducePointers();

            expect(queue.__getPrivateMembers__().head).toEqual(0);
            expect(queue.__getPrivateMembers__().tail).toEqual(3);
        });

        it("should not shift pointers when 'full'", function () {
            queue.enqueue(0);
            queue.enqueue(1);
            queue.enqueue(2);

            // shouldn't shift even though tail exceeds the max
            expect(queue.__getPrivateMembers__().tail).toEqual(3);
            queue.__getPrivateMembers__().reducePointers(2);

            expect(queue.__getPrivateMembers__().head).toEqual(0);
            expect(queue.__getPrivateMembers__().tail).toEqual(3);
        });
    });
});

