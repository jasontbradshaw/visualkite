// A carousel of items for the stream. Only supports tweets right now.

function Carousel() {
  var historyQueue = new Queue();
  var upcomingQueue = new Queue();

  this.push = function (item) {
    upcomingQueue.enqueue(item);
  };

  this.next = function () {
    var item = undefined;
    if(!upcomingQueue.isEmpty()) {
      item = upcomingQueue.peek();
      historyQueue.enqueue(upcomingQueue.dequeue());
    } else if(!historyQueue.isEmpty()) {
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
    return historyQueue.getLength() + upcomingQueue.getLength();
  };

  this._pushToHistory = function (item) {
    historyQueue.enqueue(item);
  }
};


// Queue implementation using LocalStorage.

function StoredQueue(name) {
  var storage = new LocalStorage('StoredQueue.' + name);
  storage.set('queue', []);

  this.queue = function () {
    return storage.json('queue');
  };

  this.length = function () {
    return this.queue().length;
  };

  this.push = function (item) {
    var queue = this.queue();
    queue.push(item);
    storage.set('queue', queue);
  };

  this.pop = function () {
    // TODO this is inefficient because shift() is O(n). We can do amortized
    // O(1) using offsets. Check out Queue.js.
    var queue = this.queue();
    var item = queue.shift();
    storage.set('queue', queue);
    return item;
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
