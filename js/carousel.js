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
