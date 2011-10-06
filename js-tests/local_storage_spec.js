describe("LocalStorage", function () {
    var storage;

    beforeEach(function () {
        window.localStorage.clear();
        storage = new LocalStorage('my.test', {clearExistingData: true});
    });

    afterEach(function () {
        storage.clear();
    });

    describe("_key", function () {
        it("should build key properly", function () {
            expect(storage._key('myattribute')).toEqual('LocalStorage.my.test.myattribute');
            expect(storage._key('')).toEqual('LocalStorage.my.test');
            expect(storage._key(null)).toEqual('LocalStorage.my.test');
            expect(storage._key(undefined)).toEqual('LocalStorage.my.test');
            expect(storage._key()).toEqual('LocalStorage.my.test');
        });
    });

    describe("get", function () {
        it("should return undefined if attribute does not exist", function () {
            expect(storage.get('myattribute')).toEqual(undefined);
        });

        it("should return value if it exists", function () {
            storage.set('myattribute', 'my data');
            expect(storage.get('myattribute')).toEqual("my data");
        });

        it("should return value as a string", function () {
            storage.set('myattribute', {id: 32});
            expect(storage.get('myattribute')).toEqual('{"id":32}');
        });
    });

    describe("json", function () {
        it("should return undefined if attribute does not exist", function () {
            expect(storage.json('myattribute')).toEqual(undefined);
        });

        it("should return as JSON", function () {
            storage.set('myattribute', {id: 32, names: ['elben', 'jason', 'paul']});
            expect(storage.json('myattribute')).toEqual({id :32, names: ['elben', 'jason', 'paul']});
        });

        it("should return as array", function () {
            storage.set('myattribute', ['yep', 32]);
            expect(storage.json('myattribute')).toEqual(['yep', 32]);
        });
    });

    describe("int", function () {
        it("should return undefined if attribute does not exist", function () {
            expect(storage.json('myattribute')).toEqual(undefined);
        });

        it("should return as int", function () {
            storage.set('myattribute', 32);
            expect(storage.int('myattribute')).toEqual(32);
        });
    });

    describe("incr", function () {
        it("should return undefined if attribute does not exist", function () {
            expect(storage.json('myattribute')).toEqual(undefined);
        });
        it("should increment floats", function () {
            storage.set('myattribute', 32.2);
            expect(storage.incr('myattribute')).toEqual(33.2);
            expect(storage.get('myattribute')).toEqual('33.2');
        });

        it("should increment integers", function () {
            storage.set('myattribute', 32);
            expect(storage.incr('myattribute')).toEqual(33);
            expect(storage.get('myattribute')).toEqual('33');
        });
    });
});
