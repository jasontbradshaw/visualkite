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

// a queue object that, internally, uses an array and tracks pointers to the
// head/tail so we can acheive constant-time modification. defaults to a maximum
// size of 10, but this can be specified.
function Queue (init) {
    // the list where we internally store elements. defaults to a size of 10.
    this.queue = undefined;

    // if we were given an array, create an array of that size and copy its
    // members into it.
    if (init instanceof Array) {
        this.queue = new Array(init.length);

        // copy the elements into the internal queue
        for (var i = 0; i < init.length; i++) {
            this.queue[i] = init[i];
        }

        // set the size to the size of the queue
        this.size = this.queue.length;
    }
    // if we were given a number, create an array of that size
    else if (!isNaN(init)) {
        // make sure the object is a basic number before passing it to Array
        this.queue = new Array(Number(init));
    }

    // if we were given nothing, create an array of the default size
    else if (init === undefined) {
        this.queue = new Array(10);
    }

    // we manually track the queue's head, tail, and size so we can get
    // constant-time modification.
    this.size = 0; // the number of items in the queue
    this.headIndex = 0; // index of the least recent item in the queue
    this.tailIndex = 0; // index of the most recent item in the queue, points to an empty index by default

    // wraps a number forwards in the range [0, size)
    var wrap = function (num, size) {
        if (num >= size - 1) {
            return 0;
        }

        return ++num;
    }

    // adds an item to the end of the queue. returns true if the add was
    // successful, false if the queue was full and the add didn't succeed.
    this.enqueue = function (item) {
        // don't allow an add if the queue is full
        if (this.size >= this.queue.length) {
            return false;
        }

        // put the item into the queue as the newest tail, increase the size
        this.queue[this.tailIndex] = item;
        this.size++;

        // wrap the tail
        this.tailIndex = wrap(this.tailIndex, this.queue.length);

        // return that we sucessfully inserted the item
        return true;
    }

    // dequeues an item from the queue and returns it. returns null if there
    // were no items to dequeue.
    this.dequeue = function () {
        if (this.size <= 0) {
            return null;
        }

        // store the head item away so we can return it later
        var headItem = this.queue[this.headIndex];

        // wrap the head
        this.headIndex = wrap(this.headIndex, this.queue.length);

        // decrease the size of the queue
        this.size--;

        // return the original head of the queue
        return headItem;
    }

    // returns the first item in the queue without dequeuing it. if there are no
    // items in the queue, returns null.
    this.peek = function () {
        if (this.size <= 0) {
            return null;
        }

        return this.queue[this.headIndex];
    }

    // removes all the items from the internal queue, emptying it.
    this.clear = function () {
        // reset the index pointers, effectively clearing the queue
        this.size = 0;
        this.headIndex = 0;
        this.tailIndex = 0;
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
