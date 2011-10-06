// a queue that stores items internally in an object keyed by index number. as
// items are added, the tail index is simply increased and items are added at
// ever-increasing indexes. as items are removed, the head index is decreased
// and the orphaned indexes are deleted. this allows for constant-time insertion
// and deletion. by design, the queue can only hold 2^32 - 1 items to cause an
// eventual, if infrequent, reset of pointer values.
function Queue () {
    // where the objects get stored
    var queue = {};

    // we manually track the queue's head and tail
    var head = 0; // index of the least recent item in the queue
    var tail = 0; // index of the first empty slot in the queue

    // we default to holding a max of ~4 billion items, but this limit is
    // largely arbitrary. if more are required, it could likely be increased to
    // no ill effect. it exists only to cause a reset of pointer values when
    // they grow very large, to prevent an eventual overflow.
    var resetIndex = Math.pow(2, 32) - 1;

    // cleans up the pointers if they grow too large or the queue becomes empty.
    // prevents premature overflow of queue indexes. takes a single optional
    // argument, the largest possible value for the tail pointer. defaults to a
    // max index of 2^32 - 1.
    var reducePointers = function (maxTail) {
        // take an optional argument, the largest possible value for the tail
        if (maxTail === undefined) {
            maxTail = resetIndex;
        }

        // reset pointers when we've emptied the queue
        if ((tail - head) === 0) {
            tail = 0;
            head = 0;
        }

        // do an index shift operation if our indexes become too large and the
        // queue isn't completely full.
        else if (tail > maxTail && head > 0) {
            // shift all indexes down by moving them to new indexes
            for (var i = head; i < tail; i++) {
                // move the item to a new index
                queue[i - head] = queue[i];

                // remove the old index
                delete queue[i];
            }

            // reset the canonical pointers
            tail = tail- head;
            head = 0;
        }
    }

    // returns the number of items in the queue
    this.length = function () {
        return tail - head;
    };

    // returns true when there are no items in the queue, false otherwise
    this.isEmpty = function () {
        return (tail - head) == 0;
    };

    // adds an item to the end of the queue. returns the queue itself, so calls
    // can be easily chained.
    this.enqueue = function (item) {
        // add the item to the tail and increment the tail to an empty slot
        queue[tail++] = item;

        // clean up pointers
        reducePointers();

        // return the queue object so we can chain calls
        return this;
    };

    // dequeues an item from the queue and returns it. returns null if there
    // were no items to dequeue.
    this.dequeue = function () {
        // if the queue is empty, return null
        if (head === tail) {
            return null;
        }

        // store the first item in the queue
        var dequeuedItem = queue[head];

        // delete the former head index then increment the head
        delete queue[head++];

        // clean up pointers
        reducePointers();

        // return the dequeued item
        return dequeuedItem;
    };

    // returns the first item in the queue without dequeuing it. if there are no
    // items in the queue, returns null.
    this.peek = function () {
        // if the queue is empty, return null
        if (head === tail) {
            return null;
        }

        return queue[head];
    };

    // removes all the items from the internal queue, emptying it.
    this.clear = function () {
        // reset the counters and the object, clearing the queue
        head = 0;
        tail = 0;
        queue = {};
    };

    // returns a map of all the private member variables for testing purposes.
    this.__getPrivateMembers__ = function () {
        // copy the internal queue so it can't be modified
        var queueCopy = {};
        for (var key in queue) {
            queueCopy[key] = queue[key];
        }

        // return the head, tail, a copy of the queue, and the function used to
        // reduce pointers.
        return {
            "head": head,
            "tail": tail,
            "queue": queueCopy,
            "resetIndex": resetIndex,
            "reducePointers": reducePointers
        };
    };
}
