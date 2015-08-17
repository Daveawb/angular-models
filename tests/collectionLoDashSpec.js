describe('Collections', function() {
    var Collection;
    var Model;
    var col;

    beforeEach(module('daveawb.angularModels'));

    beforeEach(inject(function(_daveawbCollection_, _daveawbModel_) {
        Collection = _daveawbCollection_;
        Model = _daveawbModel_;

        var Col = Collection.extend({
            model : Model
        });

        col = new Col([{
            name : "David", age: 33, id: 1
        }, {
            name : "Pete", age: 22, id: 2
        }]);
    }));

    it("should extend lodash each function", function() {
        var i = 0;
        col.each(function(value, key) {i++;});
        expect(i).toEqual(2);
    });

    it("should extend lodash forEach function", function() {
        var i = 0;
        col.forEach(function(value, key) {i++;});
        expect(i).toEqual(2);
    });

    it("should extend lodash map function", function() {
        col.map(function(model) {
            model.set('name', model.get('name') + ' decorated');
        });
        expect(col.get(1).get('name')).toEqual("David decorated");
        expect(col.get(2).get('name')).toEqual("Pete decorated");
    });

    it("should extend lodash collect function", function() {
        col.collect(function(model) {
            model.set('name', model.get('name') + ' decorated');
        });
        expect(col.get(1).get('name')).toEqual("David decorated");
        expect(col.get(2).get('name')).toEqual("Pete decorated");
    });

    it("should extend lodash reduce function", function() {
        var result = col.reduce(function (result, model, key) {
            return result + model.get('name');
        }, "");
        expect(result).toEqual("DavidPete");
    });

    it("should extend lodash foldl function", function() {
        var result = col.foldl(function (result, model, key) {
            return result + model.get('age');
        }, 0);
        expect(result).toEqual(33 + 22);
    });

    it("should extend lodash inject function", function() {
        var result = col.inject(function (result, model, key) {
            return result + model.get('age');
        }, 0);
        expect(result).toEqual(33 + 22);
    });

    it("should extend lodash reduceRight function", function() {
        var result = col.reduceRight(function (result, model, key) {
            return result + model.get('name');
        }, "");
        expect(result).toEqual("PeteDavid");
    });

    it("should extend lodash foldr function", function() {
        var result = col.foldr(function (result, model, key) {
            return result + model.get('age');
        }, 0);
        expect(result).toEqual(33 + 22);
    });

    it("should extend lodash find function", function() {
        var result = col.find(function(model) {
            return model.get('age') < 30;
        });

        expect(result.attributes).toEqual({name : "Pete", age: 22, id: 2});
    });

    it("should extend lodash detect function", function() {
        var result = col.detect(function(model) {
            return model.get('age') < 30;
        });

        expect(result.attributes).toEqual({name : "Pete", age: 22, id: 2});
    });

    it("should extend lodash filter function", function() {
        var result = col.filter(function(model) {
            return model.get('age') == 22;
        });

        expect(result.length).toBeLessThan(2);
        expect(result[0].attributes).toEqual({name : "Pete", age: 22, id: 2});
    });

    it("should extend lodash select function", function() {
        var result = col.select(function(model) {
            return model.get('age') == 22;
        });

        expect(result.length).toBeLessThan(2);
        expect(result[0].attributes).toEqual({name : "Pete", age: 22, id: 2});
    });

    it("should extend lodash reject function", function() {
        var result = col.reject(function(model) {
            return model.get('age') == 22;
        });

        expect(result.length).toBeLessThan(2);
        expect(result[0].attributes).toEqual({name : "David", age: 33, id: 1});
    });

    it("should extend lodash every function", function() {
        var result = col.every(function(model) {
            return model.get('age') == 22;
        });

        expect(result).toBeFalsy();

        result = col.every(function(model) {
            return model.get('age') >= 22 && model.get('age') <= 33;
        });

        expect(result).toBeTruthy();
    });

    it("should extend lodash all function", function() {
        var result = col.all(function(model) {
            return model.get('age') == 22;
        });

        expect(result).toBeFalsy();

        result = col.all(function(model) {
            return model.get('age') >= 22 && model.get('age') <= 33;
        });

        expect(result).toBeTruthy();
    });

    it("should extend lodash some function", function() {
        var result = col.some(function(model) {
            return model.get('age') == 22;
        });

        expect(result).toBeTruthy();

        result = col.some(function(model) {
            return model.get('age') == 44;
        });

        expect(result).toBeFalsy();
    });

    it("should extend lodash any function", function() {
        var result = col.any(function(model) {
            return model.get('age') == 22;
        });

        expect(result).toBeTruthy();

        result = col.any(function(model) {
            return model.get('age') == 44;
        });

        expect(result).toBeFalsy();
    });

    it("should extend lodash includes function", function() {
        var result = col.includes(col.get(1));
        expect(result).toBeTruthy();

        result = col.includes(col.get(3));
        expect(result).toBeFalsy();
    });

    it("should extend lodash include function", function() {
        var result = col.include(col.get(1));
        expect(result).toBeTruthy();

        result = col.include(col.get(3));
        expect(result).toBeFalsy();
    });


});