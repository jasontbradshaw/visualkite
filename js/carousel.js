// A carousel of items for the stream. Only supports tweets right now.
//
// Optional params:
//
//  max: max number of items. Entries will be deleted on overflow.

function Carousel(options) {
    var historyQueue = new StoredQueue('carousel.history', options);
    var upcomingQueue = new StoredQueue('carousel.upcoming', options);

    var unboundedLength = true;
    var maxItems;
    if(options !== undefined && options['max']) {
        maxItems = options['max'];
        unboundedLength = false;
    }

    this.push = function (item) {
        upcomingQueue.push(item);
        this.trim();
    };

    this.next = function () {
        var item = undefined;
        if(!upcomingQueue.isEmpty()) {
            item = upcomingQueue.peek();
            historyQueue.push(upcomingQueue.pop());
        } else if(!historyQueue.isEmpty()) {
            // Nothing in upcoming queue.
            item = historyQueue.pop();
            historyQueue.push(item);
        }
        return item;
    };

    this.isEmpty = function () {
        return historyQueue.isEmpty() && upcomingQueue.isEmpty();
    };

    this.length = function () {
        return historyQueue.length() + upcomingQueue.length();
    };

    // Removes items if number of items is above maxItems.
    // Deletion order is semi-arbitrary; it deletes the items in front of the
    // historyQueue.
    //
    // TODO to delete always the earliest-pushed items, we can use three queues.
    this.trim = function (max) {
        if(max === undefined) {
            max = maxItems;
        }
        if(this.length() > max) {
            // Delete stuff from the historyQueue first.
            var toDelete = this.length() - max;
            var toDeleteFromUpcoming = toDelete - historyQueue.length();
            while(toDelete > 0 && !historyQueue.isEmpty()) {
                historyQueue.pop();
                --toDelete;
            }
            while(toDelete > 0 && !upcomingQueue.isEmpty()) {
                upcomingQueue.pop();
                --toDelete;
            }
        }
    };

    this.clear = function () {
        historyQueue.clear();
        upcomingQueue.clear();
    }

    this._pushToHistory = function (item) {
        historyQueue.push(item);
    }
};

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
    }

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
    }

    // returns the first item in the queue without dequeuing it. if there are no
    // items in the queue, returns null.
    this.peek = function () {
        // if the queue is empty, return null
        if (head === tail) {
            return null;
        }

        return queue[head];
    }

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
    }

    // removes all the items from the internal queue, emptying it.
    this.clear = function () {
        // reset the counters and the object, clearing the queue
        head = 0;
        tail = 0;
        queue = {}
        this.length = getLength();
    }
}


// Queue implementation using LocalStorage.

function StoredQueue(name, options) {
    if(name === undefined) {
        name = (new Date()).getTime();
    }

    // Default options
    if(options === undefined) {
        options = {};
    }
    if(options.clearExistingData === undefined) {
        options.clearExistingData = false;
    }

    var storage = new LocalStorage('StoredQueue.' + name);

    if(options.clearExistingData || storage.json('queue') === undefined) {
        storage.set('queue', []);
    }

    this.queue = function () {
        return storage.json('queue');
    };

    this.length = function () {
        return this.queue().length;
    };

    this.isEmpty = function () {
        return this.length() === 0;
    };

    this.push = function (item) {
        var queue = this.queue();
        queue.push(item);
        storage.set('queue', queue);
    };

    this.peek = function () {
        if(this.isEmpty()) return undefined;
        return this.queue()[0];
    };

    this.pop = function () {
        // TODO this is inefficient because shift() is O(n). We can do amortized
        // O(1) using offsets. Check out Queue.js.
        var queue = this.queue();
        var item = queue.shift();
        storage.set('queue', queue);
        return item;
    };

    this.clear = function () {
        storage.set('queue', []);
    };
}

// LocalStorage is a wrapper around window.localStorage.
function LocalStorage(name) {

    this._key = function (attribute) {
        if(attribute && attribute !== '') {
            return "LocalStorage." + name + "." + attribute;
        }
        return "LocalStorage." + name;
    };

    this.get = function (attribute) {
        var key = this._key(attribute);
        return window.localStorage[key];
    };

    this.set = function (attribute, value) {
        if(typeof(value) !== "string") {
            value = JSON.stringify(value);
        }
        var key = this._key(attribute);
        window.localStorage[key] = value;
    };

    this.json = function (attribute) {
        var value = this.get(attribute);
        if(!value) return undefined;
        return JSON.parse(value);
    }

    this.int = function (attribute) {
        var value = this.get(attribute);
        if(!value) return undefined;
        return parseInt(value);
    }

    this.incr = function (attribute, incrValue) {
        if(incrValue === undefined) {
            incrValue = 1;
        }

        var value = this.get(attribute);
        if(!value) return undefined;

        value = parseFloat(this.get(attribute));
        this.set(attribute, value+incrValue);
        return value + incrValue;
    };

    this.clear = function (attribute) {
        var len = this._key().length;
        var namespace = this._key();
        var deletedKeys = [];

        for(var key in window.localStorage) {
            if(window.localStorage.hasOwnProperty(key)) {
                var substr = key.substring(0, len);
                if(substr === namespace) {
                    deletedKeys.push(key);
                    delete window.localStorage[key];
                }
            }
        }
        return deletedKeys;
    };

    this._allLocalStorageKeys = function () {
        var keys = [];
        for(var key in window.localStorage) {
            if(window.localStorage.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    };
}
