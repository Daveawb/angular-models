describe('Collections http', function() {
    var Collection;
    var Model;
    var $httpBackend;
    var data = [
        { id: 1, name : "David", age: 33 },
        { id: 2, name : "Iva",   age: 34 },
        { id: 3, name : "Tom",   age: 33 },
        { id: 4, name : "Jane",  age: 41 },
        { id: 4, name : "Mike",  age: 31 },
    ];
    var model = { id: 1, name: "David", age: 33 };

    beforeEach(module('Core'));

    beforeEach(inject(function (_Collection_, _Model_, _$httpBackend_) {
        Collection = _Collection_;
        Model = _Model_;
        $httpBackend = _$httpBackend_;
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe("fetching from an api with no url", function() {
        it("should error", function() {
            var col = new Collection();

            expect(col.fetch).toThrowError("A URL must be defined.");
        });
    });

    describe("fetching from the api", function() {
        it("should fetch all", function() {
            $httpBackend.expect('GET', '/testapi/items').respond(200, data);

            var Col = Collection.extend({
                url : "/testapi/items",
                model : Model
            });

            var col = new Col();

            col.fetch();

            $httpBackend.flush();
        });

        it("should fetch by id", function() {
            $httpBackend.expect('GET', '/anotherapi/lists/1').respond(200, model);

            var Col = Collection.extend({
                url : "/anotherapi/lists",
                model : Model
            });

            var col = new Col();

            col.fetch(1);

            $httpBackend.flush();
        });

        it("should fetch and set with custom path", function() {
            $httpBackend.expect('GET', '/anotherapi/lists/1').respond(200, {data:model});

            var Col = Collection.extend({
                url : "/anotherapi/lists",
                model : Model,
                path : "data"
            });

            var col = new Col();

            col.fetch(1).then(function(collection) {
                expect(collection.models[0].get('name')).toEqual("David");
            });

            $httpBackend.flush();
        });
    });

});