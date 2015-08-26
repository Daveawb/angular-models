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

    beforeEach(module('daveawb.angularModels'));

    beforeEach(inject(function (_daveawbCollection_, _daveawbModel_, _$httpBackend_) {
        Collection = _daveawbCollection_;
        Model = _daveawbModel_;
        $httpBackend = _$httpBackend_;
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
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

            expect(col.get(1).get('name')).toBe("David");
            expect(col.size()).toEqual(4);
        });

        it("should fetch and set with custom path", function() {
            $httpBackend.expect('GET', '/anotherapi/lists').respond(200, {data:data});

            var Col = Collection.extend({
                url : "/anotherapi/lists",
                model : Model,
                path : "data"
            });

            var col = new Col();

            col.fetch();

            $httpBackend.flush();

            expect(col.get(1).get('name')).toEqual("David");
            expect(col.size()).toEqual(4);
        });
    });

    describe("saving models", function() {

    });

    describe("destroying models", function() {

    });

    describe("updating models", function() {

    });
});