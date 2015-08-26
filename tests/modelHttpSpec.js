describe('Models http', function() {
    var Model;
    var $httpBackend;
    var data = {id: 1, name: "David", age: 33};
    var model;

    beforeEach(module('daveawb.angularModels'));

    beforeEach(inject(function (_daveawbModel_, _$httpBackend_) {
        Model = _daveawbModel_.extend({
            urlRoot : "/testapi/items"
        });

        $httpBackend = _$httpBackend_;
        model = new Model({ id: 1 });
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe("getting a model", function() {

        it("should populate model with api data", function() {
            $httpBackend.expect('GET', '/testapi/items/1').respond(200, data);

            model.fetch();

            $httpBackend.flush();

            expect(model.get('name')).toEqual("David");
        });

    });

    describe("saving a model", function() {

    });

    describe("destroying a model", function() {

    });

    describe("updating a model", function() {

    });
});