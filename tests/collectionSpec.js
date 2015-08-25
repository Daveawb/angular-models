describe('Collections', function() {
    var Collection;
    var Model;

    beforeEach(module('daveawb.angularModels'));

    beforeEach(inject(function(_daveawbCollection_, _daveawbModel_) {
        Collection = _daveawbCollection_;
        Model = _daveawbModel_;
    }));

    it("should be extendable", function() {
        var Col = Collection.extend({iAm:function() { return "a collection"; }});
        var col = new Col();

        expect(col.iAm).toBeDefined();
        expect(col.iAm()).toEqual("a collection");
    });

    it("should not break prototype chains", function() {
        var ColOne = Collection.extend({iAm:function() { return "a collection"; }});
        var ColTwo = Collection.extend({iAm:function() { return "a collection"; }});

        expect(new ColOne() instanceof Collection).toBe(true);
        expect(new ColTwo() instanceof Collection).toBe(true);
        expect(new ColOne() instanceof ColTwo).toBe(false);
        expect(new ColTwo() instanceof ColOne).toBe(false);
    });

    it("should not pollute other collections prototypes", function() {
        var ModelOne = Model.extend({iAm:function() { return "a model"}})
        var ModelTwo = Model.extend({whatIf:function() { return "I am also on model one?!?"}})
        var ColOne = Collection.extend({model : ModelOne, iAm:function() { return "a collection"; }});
        var ColTwo = Collection.extend({model : ModelTwo, WhatIf:function() { return "I am also on collection one?!?"; }});

        var colOne = new ColOne({ id: 1, name : "David"});
        var colTwo = new ColTwo({ id: 1, name : "Iva"});

        expect(colOne.models[0]).not.toEqual(colTwo.models[0]);
        expect(colOne.models[0] instanceof ModelOne).toBe(true);
        expect(colOne.models[0] instanceof ModelTwo).toBe(false);
        expect(colOne.models[0].whatIf).toBeUndefined();
        expect(colTwo.models[0].whatIf).toBeDefined();
    })

    it("should build models from data", function() {
        var Mod = Model.extend({});
        var Col = Collection.extend({
           model : Mod
        });

        var col = new Col([
            { name : "David" },
            { name : "Iva" },
            { name : "Alex" }
        ]);

        expect(col.models.length).toEqual(3);
        expect(col.models[0].get('name')).toEqual('David');
    });

    it("should add the collection reference to the model", function() {
        var Mod = Model.extend({});
        var Col = Collection.extend({
            model : Mod
        });

        var NotCol = Collection.extend({
            model : Model
        });

        var col = new Col([
            { name : "David" },
            { name : "Iva" },
            { name : "Alex" }
        ]);

        var model = col.findWhere({name:"David"});

        expect(model.collection).toEqual(col);
        expect(model.collection instanceof Col).toEqual(true);
        expect(model.collection instanceof NotCol).toEqual(false);
    });

    it("should update a model if it already exists", function() {
        var Col = Collection.extend({
            model : Model
        });

        var col = new Col([
            { name : "David", age: 33, id: 1 }
        ]);

        col.set({ name : "David Barker", id: 1});

        expect(col.get(1).get('name')).toEqual('David Barker');
        expect(col.get(1).get('age')).toEqual(33);
    });

    it("should find models where properties match a predicate object", function() {
        var Mod = Model.extend({});
        var Col = Collection.extend({
            model : Mod
        });

        var col = new Col([
            { name : "David", age:34 },
            { name : "Iva", age:34 },
            { name : "Alex", age:23 }
        ]);

        expect(col.findWhere({name:"David"}).get('name')).toBe("David");
        expect(col.where({age:34}).length).toBe(2);
    });
});