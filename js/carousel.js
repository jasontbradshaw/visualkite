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
  if(typeof options != "undefined" && options['max']) {
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
    if(typeof max == "undefined") {
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


// Queue implementation using LocalStorage.

function StoredQueue(name, options) {
  if(typeof(name) == "undefined") {
    name = (new Date()).getTime();
  }

  // Default options
  if(typeof(options) == "undefined") {
    options = {};
  }
  if(typeof(options.clearExistingData) == "undefined") {
    options.clearExistingData = false;
  }

  var storage = new LocalStorage('StoredQueue.' + name);

  if(options.clearExistingData || storage.json('queue') == undefined) {
    storage.set('queue', []);
  }

  this.queue = function () {
    return storage.json('queue');
  };

  this.length = function () {
    return this.queue().length;
  };

  this.isEmpty = function () {
    return this.length() == 0;
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
//
// Requires json2.js.

function LocalStorage(name) {

  this._key = function (attribute) {
    if(attribute && attribute != '') {
      return "LocalStorage." + name + "." + attribute;
    }
    return "LocalStorage." + name;
  };

  this.get = function (attribute) {
    var key = this._key(attribute);
    return window.localStorage[key];
  };

  this.set = function (attribute, value) {
    if(typeof(value) != "string") {
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
    if(typeof incrValue == "undefined") {
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
        if(substr == namespace) {
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
