// a queue that stores items internally in an object keyed by index number. as
// items are added, the tail index is simply increased and items are added at
// ever-increasing indexes. as items are removed, the head index is decreased
// and the orphaned indexes are deleted. this allows for constant-time insertion
// and deletion.
function Queue () {
    // where the objects get stored
    var queue = {};

    // we manually track the queue's head and tail
    var head = 0; // index of the least recent item in the queue
    var tail = 0; // index of the first empty slot in the queue

    // a public member that contains the calculated length of the queue. nothing
    // internal depends on this, it just gets updated every time the length
    // changes (prevents user breaking the queue).
    this.length = 0;

    // a simple function for keeping the length member up-to-date
    var getLength = function () {
        return tail - head;
    };

    // adds an item to the end of the queue. returns the queue itself, so calls
    // can be easily chained.
    this.enqueue = function (item) {
        // add the item to the tail and increment the tail to an empty slot
        queue[tail++] = item;
        this.length = getLength();

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
        this.length = getLength();

        // reset the queue and the pointers if we've emptied the queue. this
        // should keep the indexes from growing too large, as long as the queue
        // is peridically emptied.
        if (getLength() === 0) {
            this.clear();
        }

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

    this.isEmpty = function () {
        return this.length == 0;
    };

    // returns a map of all the private member variables for testing purposes.
    this.__getPrivateMembers__ = function () {
        // copy the internal queue so it can't be modified
        var queueCopy = {};
        for (var key in queue) {
            queueCopy[key] = queue[key];
        }

        // return the head, tail, and a copy of the queue
        return {
            "head": head,
            "tail": tail,
            "queue": queueCopy,
        };
    };

    // removes all the items from the internal queue, emptying it.
    this.clear = function () {
        // reset the counters and the object, clearing the queue
        head = 0;
        tail = 0;
        queue = {}
        this.length = getLength();
    };
}
