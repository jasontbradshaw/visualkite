// A carousel of items for the stream. Only supports tweets right now.
//
// Optional params:
//
//  max: max number of items. Entries will be deleted on overflow.

function Carousel(options) {
    var historyQueue = new Queue()
    var upcomingQueue = new Queue()

    var unboundedLength = true;
    var maxItems;
    if (options !== undefined && options['max']) {
        maxItems = options['max'];
        unboundedLength = false;
    }

    this.push = function (item) {
        upcomingQueue.enqueue(item);
        this.trim();
    };

    this.next = function () {
        var item = undefined;

        if (!upcomingQueue.isEmpty()) {
            item = upcomingQueue.peek();
            historyQueue.enqueue(upcomingQueue.dequeue());
        }
        else if (!historyQueue.isEmpty()) {
            // Nothing in upcoming queue.
            item = historyQueue.dequeue();
            historyQueue.enqueue(item);
        }

        return item;
    };

    this.isEmpty = function () {
        return historyQueue.isEmpty() && upcomingQueue.isEmpty();
    };

    this.length = function () {
        return historyQueue.length() + upcomingQueue.length();
    };

    this.lengthUpcoming = function () {
        return upcomingQueue.length();
    }

    this.lengthHistory = function () {
        return historyQueue.length();
    }

    // Removes items if number of items is above maxItems.
    // Deletion order is semi-arbitrary; it deletes the items in front of the
    // historyQueue.
    //
    // TODO to delete always the earliest-pushed items, we can use three queues.
    this.trim = function (max) {
        if (max === undefined) {
            max = maxItems;
        }

        // Delete stuff from the historyQueue first.
        while (this.length() > max && !historyQueue.isEmpty()) {
            historyQueue.dequeue();
        }
        while (this.length() > max && !upcomingQueue.isEmpty()) {
            upcomingQueue.dequeue();
        }
    };

    this.clear = function () {
        historyQueue.clear();
        upcomingQueue.clear();
    }

    this._pushToHistory = function (item) {
        historyQueue.enqueue(item);
    }
};

