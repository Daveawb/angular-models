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

        it("should populate model with api data and custom path", function() {
            $httpBackend.expect('GET', '/testapi/items/1').respond(200, { data : { models : data } });

            var M = Model.extend({ path : "data.models" });
            var model = new M({id:1});

            model.fetch();

            $httpBackend.flush();

            expect(model.get('name')).toEqual("David");
        });

        it("should parse data", function() {
            $httpBackend.expect('GET', '/testapi/items/1').respond(200, data);

            spyOn(model, "parse").and.callThrough();

            model.fetch();

            $httpBackend.flush();

            expect(model.parse).toHaveBeenCalled();
        });

        it("should not parse data if set to false", function() {
            $httpBackend.expect('GET', '/testapi/items/1').respond(200, data);

            spyOn(model, "parse");

            model.fetch({ parse : false });

            $httpBackend.flush();

            expect(model.parse).not.toHaveBeenCalled();
        });

        it("should call a custom success function", function() {
            $httpBackend.expect('GET', '/testapi/items/1').respond(200, data);

            var options = {
                success : function(response) {
                    return response;
                }
            }

            spyOn(options, "success").and.callThrough();

            model.fetch(options);

            $httpBackend.flush();

            expect(options.success).toHaveBeenCalled();
        });

    });

    describe("saving a model", function() {

    });

    describe("destroying a model", function() {

    });

    describe("updating a model", function() {

    });
});