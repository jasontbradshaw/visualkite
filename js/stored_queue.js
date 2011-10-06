// Queue implementation using LocalStorage.
//
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
