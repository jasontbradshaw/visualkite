// LocalStorage is a wrapper around window.localStorage.
//
// window.localStorage is a simple key-value hash, where the values are strings.
// LocalStorage makes it easier to work with local storage through helpers that
// allow you to store and load JSON objects into local storage.
//
// LocalStorage also namespaces local storage keys, to prevent collisions.
//
// Example use:
//
//      var storage = new LocalStorage('MyQueue');
//      storage.set('queue', []);
//      var q = storage.json('queue');
//      q.push("item1");
//      storage.set('queue', q);
//
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
