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

        var result = col.find({name:"Pete"});

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

    it("should extend lodash contains function", function() {
        var result = col.include(col.get(1));
        expect(result).toBeTruthy();

        result = col.include(col.get(3));
        expect(result).toBeFalsy();
    });

    it("should extend lodash invoke function", function() {
        var model = col.get(1);

        col.invoke('set', 'active', false);

        expect(model.get('active')).toBe(false);
    });

    it("should extend lodash max function", function() {
        var result = col.max(function(model) {
            return model.get('age');
        });

        expect(result.get('age')).toEqual(33);
    });

    it("should extend lodash min function", function() {
        var result = col.min(function(model) {
            return model.get('age');
        });

        expect(result.get('age')).toEqual(22);
    });

    it("should extend lodash toArray function", function() {
        var result = col.toArray();

        expect(_.isArray(result)).toBe(true);
    });

    it("should extend lodash size function", function() {
        expect(col.size()).toEqual(2);
    });

    it("should extend lodash first function", function() {
        expect(col.first().get('name')).toEqual("David");
    });

    it("should extend lodash head function", function() {
        expect(col.head().get('name')).toEqual("David");
    });

    it("should extend lodash take function", function() {
        expect(col.take(1)[0].get('name')).toEqual("David");
        expect(col.take(1)[1]).toBeUndefined();
        expect(col.take(2)[1].get('name')).toEqual("Pete");
    });

    it("should extend lodash initial function", function() {
        expect(col.initial().length).toEqual(1);
    });

    it("should extend lodash rest function", function() {
        expect(col.rest().length).toEqual(1);
        expect(col.rest()[0].get('name')).toEqual("Pete");
    });

    it("should extend lodash tail function", function() {
        expect(col.tail().length).toEqual(1);
        expect(col.tail()[0].get('name')).toEqual("Pete");
    });

    it("should extend lodash drop function", function() {
        expect(col.drop(1).length).toEqual(1);
        expect(col.drop(2).length).toEqual(0);
        expect(col.drop(1)[0].get('name')).toEqual("Pete");
    });

    it("should extend lodash last function", function() {
        expect(col.last().get('name')).toEqual("Pete");
    });

    it("should extend lodash without function", function() {
        var pete = col.get(2);
        var david = col.get(1);
        expect(col.without(pete).length).toEqual(1);
        expect(col.without(pete)[0].get('name')).toEqual("David");
        expect(col.without(david).length).toEqual(1);
        expect(col.without(david)[0].get('name')).toEqual("Pete");
    });

    it("should extend lodash difference function", function() {
        var pete = col.get(2);
        var david = col.get(1);
        expect(col.difference([pete]).length).toEqual(1);
        expect(col.difference([david]).length).toEqual(1);
        expect(col.difference([david,pete]).length).toEqual(0);
        expect(col.difference([1]).length).toEqual(2);
    });

    it("should extend lodash indexof function", function() {
        var pete = col.get(2);
        var david = col.get(1);
        expect(col.indexOf(david)).toEqual(0);
        expect(col.indexOf(pete)).toEqual(1);
    });

    it("should extend lodash shuffle function", function() {
        var david = col.get(1);
        expect(col.shuffle().length).toEqual(2);
    });

    it("should extend lodash lastIndexof function", function() {
        var pete = col.get(2);
        expect(col.lastIndexOf(pete)).toEqual(1);
    });

    it("should extend lodash isEmpty function", function() {
        expect(col.size()).toEqual(2);
    });

    it("should extend lodash chain function", function() {
        expect(col.isEmpty()).toBeFalsy();
        var nCol = new Collection();
        expect(nCol.isEmpty()).toBeTruthy();
    });

    it("should extend lodash sample function", function() {
        expect(col.sample() instanceof Model).toBe(true);
    });

    it("should extend lodash partition function", function() {
        expect(col.partition(function(model) {
            return model.get('age') > 25
        }).length).toEqual(2);
    });
});