(function(angular, factory) {

    angular.module('daveawb.angularModels')
        .factory('daveawbCollection', ["daveawbHelpers", "daveawbSync", factory]);

})(angular, function(helpers, sync) {

    var lodashMethods = {
        forEach: 3, each: 3, map: 3, collect: 3, reduce: 4,
        foldl: 4, inject: 4, reduceRight: 4, foldr: 4, find: 3, detect: 3, filter: 3,
        select: 3, reject: 3, every: 3, all: 3, some: 3, any: 3, include: 2, includes: 2,
        contains: 2, invoke: 0, max: 3, min: 3, toArray: 1, size: 1, first: 3,
        head: 3, take: 3, initial: 3, rest: 3, tail: 3, drop: 3, last: 3,
        without: 0, difference: 0, indexOf: 3, shuffle: 1, lastIndexOf: 3,
        isEmpty: 1, chain: 1, sample: 3, partition: 3
    };

    /**
     * The collection
     * @param models
     * @param options
     * @constructor
     */
    var Collection = function (models, options) {
        options || (options = {});
        if (options.model) {
            this.model = options.model;
        }
        this.models = [];
        this._byId = {};

        this.set(models, options);
    }

    _.extend(Collection.prototype, {

        /**
         * The model used for this collection
         */
        model: null,

        /**
         * Set models on this collection
         * @param models
         * @param options
         * @returns {Collection}
         */
        set: function (models, options) {
            var self = this,
                Model = this.model,
                singular = !_.isArray(models);

            options || (options = {});

            models = singular ? (models ? [models] : []) : models.slice();

            _.each(models, function (value) {
                var exists = self.get(value);
                if (exists) {
                    exists.set(value, options);
                } else {
                    var model = new Model(value, _.extend({collection:self}, options));
                    self.models.push(model);

                    if (model.isNew()) {
                        self._byId[model.uid] = model;
                    } else {
                        self._byId[self.modelId(model)] = model;
                    }
                }
            });

            return this;
        },

        /**
         * Reset models
         * @param models
         * @param options
         * @returns {*}
         */
        reset: function(models, options) {
            options = options ? _.clone(options) : {};
            //for (var i = 0; i < this.models.length; i++) {
            //    this._removeReference(this.models[i], options);
            //}
            options.previousModels = this.models;
            this._reset();
            models = this.add(models, _.extend({}, options));
            return models;
        },

        /**
         * Get a model by
         * @param obj
         * @returns {*}
         */
        get: function (obj) {
            if (obj == null) return void 0;
            var id = this.modelId(this._isModel(obj) ? obj.attributes : obj);
            return this._byId[obj] || this._byId[id] || this._byId[obj.uid];
        },

        /**
         * Find a model
         * @param attrs
         * @param first
         * @returns {*}
         */
        where : function(attrs, first) {
            return this[first ? 'find' : 'filter'](attrs);
        },

        /**
         * Find a model by attributes
         * @param attrs
         */
        findWhere: function(attrs) {
            return this.where(attrs, true);
        },

        /**
         * Pluck a specific attribute from each model
         * @param attr
         */
        pluck: function(attr) {
            return this.map(function(model) {
                return model.attributes[attr];
            });
        },

        /**
         * Retrieve the model ID attribute
         * @param attrs
         * @returns {*}
         */
        modelId: function (attrs) {
            return attrs[this.model.prototype.idAttribute || 'id'];
        },

        /**
         * Check the object is a model
         * @param model
         * @returns {boolean}
         * @private
         */
        _isModel: function (model) {
            return model instanceof this.model;
        },

        /**
         * Sync function
         * @returns {*}
         */
        sync : function() {
            return Collection.$http.apply(this, arguments);
        },

        /**
         * Fetch data from the API
         */
        fetch: function (options) {
            options = _.extend({parse: true}, options);
            var success = options.success || _.noop;
            var collection = this;
            
            return this.sync('read', this, options).then(function(response) {
                var method = options.reset ? 'reset' : 'set';
                var data = collection.path ? helpers.object_path(response.data, collection.path) : response.data;
                collection[method](data, options);
                success instanceof Function && success.call(collection, collection, response, options);
                return collection;
            });
        },

        /**
         * Parse a response
         * @param data
         * @returns {boolean}
         */
        parse: function (response) {
            return response;
        }
    });

    Collection.extend  = helpers.extender;
    Collection.helpers = helpers;
    Collection.$http   = sync;

    helpers.lodash_methods(Collection, lodashMethods, 'models');

    return Collection;
});