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


// Queue implementation using local storage.

function StoredQueue(name) {
  window.localStorage["StoredQueue." + name + ".length"] = 0;

  this._key = function (attribute) {
    if(attribute && attribute != '') {
      return "StoredQueue." + name + "." + attribute;
    }
    return "StoredQueue." + name;
  };

  this._get = function (attribute) {
    var key = this._key(attribute);
    return window.localStorage[key];
  };

  this._set = function (attribute, value) {
    var key = this._key(attribute);
    window.localStorage[key] = value;
  };

  this._incr = function (attribute) {
    var value = parseInt(this._get(attribute));
    this._set(attribute, value+1);
  };

  this._json = function (attribute) {
    return JSON.parse(this._get(attribute));
  }

  this.length = function () {
    return parseInt(this._get('length'));
  };

  this.push = function (item) {
    this._incr('length');
    var queue = this._json('queue');
    // TODO
  };

  this.pop = function () {
    // TODO make it cool like Queue.js
  };
}
