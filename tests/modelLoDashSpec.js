describe('Models', function() {
    var Model, model;

    beforeEach(module('daveawb.angularModels'));

    beforeEach(inject(function (_daveawbModel_) {
        Model = _daveawbModel_;
        model = new Model({
            id : 1,
            first_name : "David",
            last_name : "Barker",
            job_title : "Developer"
        });
    }));

    it("should extend lodash keys function", function () {
        expect(model.keys()).toEqual(["id", "first_name", "last_name", "job_title"]);
    });

    it("should extend lodash values function", function () {
        expect(model.values()).toEqual([1,"David","Barker","Developer"]);
    });

    it("should extend lodash pairs function", function() {
        expect(model.pairs()).toEqual([["id",1],["first_name", "David"],["last_name", "Barker"], ["job_title", "Developer"]]);
    });

    it("should extend lodash invert function", function() {
        expect(model.invert()).toEqual({1:"id","David":"first_name","Barker":"last_name","Developer":"job_title"});
    });

    it("should extend lodash pick function", function() {
        expect(model.pick(_.isNumber)).toEqual({"id":1});
        expect(model.pick('first_name')).toEqual({"first_name":"David"});
    });

    it("should extend lodash omit function", function() {
        expect(model.omit('job_title')).toEqual({"id":1,"first_name":"David","last_name":"Barker"});
    });
});