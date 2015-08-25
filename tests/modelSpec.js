describe('Models', function() {
    var Model;

    beforeEach(module('daveawb.angularModels'));

    beforeEach(inject(function(_daveawbModel_) {
        Model = _daveawbModel_;
    }));

    describe('that are extendable', function () {
        it('should extend', function () {

            var NewModel = Model.extend({ newFunc : function() { return 'hello' }});

            var model = new NewModel();

            expect(model.newFunc).toBeDefined();
            expect(model.newFunc()).toEqual('hello');
        });

        it('should not break prototype chain', function() {

            var ModelOne    = Model.extend({ iAm : function() { return 'model 1' }});
            var ModelTwo    = Model.extend({ iAm : function() { return 'model 2' }});
            var ModelThree  = ModelOne.extend();

            var modelOne = new ModelOne;
            var modelTwo = new ModelTwo;
            var modelThree = new ModelThree;

            expect(modelThree instanceof ModelOne).toBe(true);
            expect(modelThree instanceof ModelTwo).toBe(false);

            expect(modelOne instanceof Model).toBe(true);
            expect(modelTwo instanceof Model).toBe(true);
            expect(modelThree instanceof Model).toBe(true);

            expect(modelOne.iAm()).toEqual('model 1');
            expect(modelTwo.iAm()).toEqual('model 2');
            expect(modelThree.iAm()).toEqual('model 1');
        });

        it('should not maintain prototype as reference', function() {
            var ModelOne    = Model.extend({ model : 'model 1', iAm : function() { return this.model }});
            var ModelTwo    = ModelOne.extend({ model : 'model 2' });

            var modelOne = new ModelOne;
            var modelTwo = new ModelTwo;

            expect(modelOne.iAm()).toEqual('model 1');
            expect(modelTwo.iAm()).toEqual('model 2');
        })
    });

    describe("that can be initialised with attributes", function() {

        it('should have an array of attributes', function() {
            var attributes = { id : 1, name: "David" };
            var user = new Model(attributes);

            expect(typeof user.attributes === 'object').toBe(true);
            expect(user.attributes).toEqual(attributes);
        });
    });

    describe("that can get and set attributes", function() {

        it('should set an attribute', function() {
            var user = new Model({ id : 1, name: "David" });
            expect(user.set).toBeDefined();
            user.set('name', 'Tom');
            expect(user.attributes.name).toEqual('Tom');
        });

        it('should get an attribute', function() {
            var user = new Model({ id : 1, name: "David" });
            expect(user.get).toBeDefined();
            expect(user.get('name')).toEqual('David');
        });

        it('should set a hash of model attributes', function() {
            var model = new Model();
            var attributes = { name : 'David', age : 30, height: '180cm'};
            model.set(attributes);
            expect(model.attributes).toEqual(attributes);
        });

        it('should unset an attribute', function() {
            var attributes = { name : 'David', age : 30, height: '180cm'};
            var model = new Model(attributes);

            model.unset('name');

            expect(model.has('name')).toBe(false);
        });

        it('should unset a hash of attributes', function() {
            var attributes = { name : 'David', age : 30, height: '180cm'};
            var model = new Model(attributes);

            model.unset(attributes);

            expect(model.attributes).toEqual({});
        });

        it("should get model as JSON", function() {
            var attributes = { name : 'David', age : 30, height: '180cm'};
            var model = new Model(attributes);

            expect(model.toJson()).toEqual(JSON.stringify(attributes));
        });

        it("should get model as Object", function() {
            var attributes = { name : 'David', age : 30, height: '180cm'};
            var model = new Model(attributes);

            expect(model.toObject()).toEqual(attributes);
        });

        it("should get an escaped HTML encoded attribute", function()
        {
            var attributes = {
                name : 'David',
                age : 30,
                height: '180cm',
                description: "<p>David rocks</p>"
            };

            var model = new Model(attributes);

            expect(model.escape('description')).toEqual("&lt;p&gt;David rocks&lt;/p&gt;");
        });
    });

    describe("it can get the state of an attribute", function() {

        it('should inform that an attribute has a non-null or non-undefined value', function() {
            var user = new Model({ id : 1, name: "David" });
            expect(user.has('name')).toBe(true);
            expect(user.has('address')).toBe(false);

            user.set('height', null);
            expect(user.has('height')).toBe(false);

            user.set('height', undefined);
            expect(user.has('height')).toBe(false);

            user.set('height', '');
            expect(user.has('height')).toBe(true);

            user.set('height', 0);
            expect(user.has('height')).toBe(true);
        });

    });

    describe("that can be initialised with default attributes", function() {

        it('should have default attributes', function() {
            var User = Model.extend({
                defaults : {
                    "name"  : "David",
                    "age"   : 33
                }
            });

            var user = new User();

            expect(user.get('name')).toEqual('David');
        });

    });

    describe("that are guarded or fillable apply mass assignment rules", function() {

        it('should guard guarded attributes and allow assignment of all others', function() {
            var attributes = { name : 'David', age : 30, height: '180cm'};
            var Guarded = Model.extend({
                guarded : ["name", "height"]
            });
            var model = new Guarded(attributes);

            expect(model.get('name')).toBeUndefined();
            expect(model.get('height')).toBeUndefined();

            model.set('age', 33);
            expect(model.get('age')).toEqual(33);
        });

        it('should fill fillable attributes and not any others', function() {
            var attributes = { name : 'David', age : 30, height: '180cm'};
            var Fillable = Model.extend({
                fillable : ["age"]
            });
            var model = new Fillable(attributes);

            expect(model.get('name')).toBeUndefined();
            expect(model.get('height')).toBeUndefined();

            model.set('age', 33);
            expect(model.get('age')).toEqual(33);
        });
    });

    describe("that have get and set mutators", function() {

        it('should run through a setter', function() {
            var User = Model.extend({
                getters : {
                    name : function(value) {
                        return value + 'mutated';
                    }
                }
            });

            var user = new User();
            user.set('name', 'David');
            expect(user.get('name')).toEqual('Davidmutated');
        });

        it('should run through a getter', function() {
            var User = Model.extend({
                setters : {
                    name : function(value) {
                        return value + 'mutated';
                    }
                }
            });

            var user = new User();
            user.set('name', 'David');
            expect(user.get('name')).toEqual('Davidmutated');
        });

    });

    describe("that have type casts", function() {

        it('should type cast values', function() {
            var CastModel = Model.extend({
                cast : { age : 'Int', active : 'Bool', created_at : 'Date' }
            });

            var castModel = new CastModel();

            castModel.set('age', '30');
            castModel.set('active', 'true');
            castModel.set('created_at', '2014/12/5 12:14:34');
            expect(castModel.get('age')).toEqual(30);
            expect(castModel.get('active')).toEqual(true);

            expect(castModel.get('created_at').toString()).toEqual('Fri Dec 05 2014 12:14:34 GMT+0000 (GMT)');
            castModel.set('active', 'false');
            expect(castModel.get('active')).toEqual(false);
            castModel.set('active', '0');
            expect(castModel.get('active')).toEqual(false);
        });

    });

    describe("should have changed attributes", function() {

        it("should have a changed attribute", function() {
            var model = new Model({name:"David"});

            expect(model.hasChanged('name')).toBe(false);

            model.set('name', 'Iva');

            expect(model.hasChanged('name')).toBe(true);
        });
    });

    describe("should set ids", function() {
        it("should assign id", function() {
            var model = new Model({name:"David", id:1});
            expect(model.id).toEqual(1);
        });

        it("should assign id from different attribute", function() {
            var model = new (Model.extend({idAttribute : '__id'}))({name:"David", '__id':1});
            expect(model['__id']).toEqual(1);
        });

        it("should assign id even with mass assignment rules", function() {
            var model = new (Model.extend({
                fillable : ['name']
            }))({name:"David", id:1});
            expect(model.id).toEqual(1);

            var model = new (Model.extend({
                guarded : ['id']
            }))({name:"David", id:1});
            expect(model.id).toEqual(1);
        });
    });

    it("should be new if no id is set", function() {
        var model = new Model({name : "David"});
        expect(model.isNew()).toBe(true);
        model.set('id', 1);
        expect(model.isNew()).toBe(false);
    })
});