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

        it("should persist a new model", function() {

            var tmp = _.clone(data);
            delete(tmp.id);

            $httpBackend.expect('POST', '/testapi/items').respond(201, data);

            var unsaved = new Model(tmp);

            unsaved.save();

            $httpBackend.flush();

            expect(unsaved.get('id')).toBe(1);
        });

        it("should persist a new model and parse data", function() {
            var tmp = _.clone(data);
            delete(tmp.id);

            $httpBackend.expect('POST', '/testapi/items').respond(201, data);

            var unsaved = new Model(tmp);

            spyOn(unsaved, "parse").and.callThrough();

            unsaved.save();

            $httpBackend.flush();

            expect(unsaved.parse).toHaveBeenCalled();
        });

        it("should update a model if it already exists", function() {
            $httpBackend.expect('PUT', '/testapi/items/1').respond(200, _.extend(data, {name: 'Graham'}));

            model.save('name', 'Graham');

            $httpBackend.flush();

            expect(model.get('name')).toBe('Graham');
        });
    });

    describe("destroying a model", function() {
        it("should delete a model on the backend", function() {
            $httpBackend.expect('DELETE', '/testapi/items/1').respond(200);

            model.delete()
        });
    });

    describe("updating a model", function() {

    });
});