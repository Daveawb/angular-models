(function(angular) {
    angular.module('daveawb.angularModels', []);
})(angular);
(function() {

    angular.module('daveawb.angularModels')
        .factory('daveawbHelpers', Factory);

    /**
     * The factory wrapper for DI
     * @param $http
     * @param $extender
     * @returns {Object}
     * @constructor
     */
    function Factory() {
        return {
            object_path : stringPath,
            lodash_methods : addLodashMethods,
            extender : extend,
            urlError : urlError
        }
    }

    Factory.$inject = [];

    /**
     * Helper function to get nested data from an object using
     * a string dot notated path
     * @param object
     * @param path
     * @returns {*}
     */
    function stringPath(object, path) {
        path = path.replace(/^\./, '');
        var props = path.split('.');
        for (var i = 0, n = props.length; i < n; ++i) {
            var k = props[i];
            if (k in object) {
                object = object[k];
            } else {
                return;
            }
        }
        return object;
    };

    /**
     *
     * @param length
     * @param method
     * @param attribute
     * @returns {Function}
     */
    function addMethod(length, method, attribute) {
        switch (length) {
            case 1:
                return function () {
                    return _[method](this[attribute]);
                };
            case 2:
                return function (value) {
                    return _[method](this[attribute], value);
                };
            case 3:
                return function (iteratee, context) {
                    return _[method](this[attribute], itCb(iteratee, this), context);
                };
            case 4:
                return function (iteratee, defaultVal, context) {
                    return _[method](this[attribute], itCb(iteratee, this), defaultVal, context);
                };
            default:
                return function () {
                    var args = [].slice.call(arguments);
                    args.unshift(this[attribute]);
                    return _[method].apply(_, args);
                };
        }
    };

    /**
     *
     * @param Class
     * @param methods
     * @param attribute
     */
    function addLodashMethods(Class, methods, attribute) {
        _.each(methods, function (length, method) {
            if (_[method]) Class.prototype[method] = addMethod(length, method, attribute);
        });
    };

    /**
     *
     * @param iteratee
     * @param instance
     * @returns {*}
     */
    var itCb = function (iteratee, instance) {
        if (_.isFunction(iteratee)) return iteratee;
        if (_.isObject(iteratee) && !instance._isModel(iteratee)) return modelMatcher(iteratee);
        if (_.isString(iteratee)) return function (model) {
            return model.get(iteratee);
        };
        return iteratee;
    };

    /**
     * Model match
     * @param attrs
     * @returns {Function}
     */
    var modelMatcher = function (attrs) {
        var matcher = _.matches(attrs);
        return function (model) {
            return matcher(model.attributes);
        };
    };

    /**
     * Extend a class
     * @param protoProps
     * @param staticProps
     * @returns {*}
     */
    function extend(protoProps, staticProps) {
        var parent = this;
        var child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent's constructor.
        if (protoProps && _.has(protoProps, 'constructor')) {
            child = protoProps.constructor;
        } else {
            child = function () {
                return parent.apply(this, arguments);
            };
        }

        // Add static properties to the constructor function, if supplied.
        _.extend(child, parent, staticProps);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        var Surrogate = function () {
            this.constructor = child;
        };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate;

        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) _.extend(child.prototype, protoProps);

        // Set a convenience property in case the parent's prototype is needed
        // later.
        child.__super__ = parent.prototype;

        return child;
    };

    /**
     * Throw an error where a url is required
     */
    function urlError() {
        throw new Error("A URL must be defined on a collection or a urlRoot on a model.");
    }

})();
(function(angular) {
    angular.module('daveawb.angularModels')
        .factory('daveawbCollection', Service);

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
     * The factory wrapper for DI
     * @param helpers
     * @param $http
     * @returns {Object}
     * @constructor
     */
    function Service(helpers, $http) {

        Collection.extend = helpers.extender;
        Collection.http = $http;
        Collection.helpers = helpers;

        helpers.lodash_methods(Collection, lodashMethods, 'models');

        return Collection;
    }

    Service.$inject = ["daveawbHelpers", "$http"];

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
         * Fetch data from the API
         */
        fetch: function (id) {
            var self = this;
            var url = this.url;

            if (!url) Collection.helpers.urlError();

            if (id) {
                url = url.split('/');
                url.push(id)
                url = url.join('/');
            }

            return Collection.http.get(url).then(function (response) {
                response = self.parse(response);
                var data = self.path ? Collection.helpers.object_path(response.data, self.path) : response.data;
                self.set(data);
                return self;
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

})(angular);
(function(angular) {

    angular.module('daveawb.angularModels')
        .service('daveawbModel', ModelService);

    /**
     * Lodash methods models use
     * @type {{keys: number, values: number, pairs: number, invert: number, pick: number, omit: number, chain: number, isEmpty: number}}
     */
    var lodashMethods = {
        keys: 1,
        values: 1,
        pairs: 1,
        invert: 1,
        pick: 0,
        omit: 0,
        chain: 1,
        isEmpty: 1
    };

    /**
     * The service wrapper for DI
     * @param $http
     * @param $extender
     * @returns {Object}
     * @constructor
     */
    function ModelService(helpers, sync, $http) {
        Model.extend = helpers.extender;
        Model.helpers = helpers;
        Model.$http = sync;

        helpers.lodash_methods(Model, lodashMethods, 'attributes');

        return Model;
    }

    ModelService.$inject = ["daveawbHelpers", "daveawbSync", "$http"]

    /**
     * A generic model
     * @constructor
     * @param attributes
     * @param options
     */
    function Model(attributes, options) {
        var attrs = attributes || {};
        options || (options = {});
        this.attributes = {};
        if (options.collection) this.collection = options.collection;
        if (options.parse) attrs = this.parse(attrs, options) || {};
        this.isGuarded  = _.isArray(this.guarded);
        this.isFillable = ! this.isGuarded && _.isArray(this.fillable);
        attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
        this.set(attrs, options);
    }

    _.extend(Model.prototype, {

        /**
         * Attributes to be type cast
         */
        cast : {},

        /**
         * Hash of changed properties
         */
        changed : [],

        /**
         * Internal ID
         */
        uid : null,

        /**
         * Default model values
         */
        defaults : {},

        /**
         * A whitelist of model attributes that can be mass assignable
         */
        fillable : null,

        /**
         * A blacklist of model attributes that are not mass assignable
         */
        guarded : null,

        /**
         * Attribute getters
         */
        getters : {},

        /**
         * The id attribute for this model
         */
        idAttribute : 'id',

        /**
         * Attribute setters
         */
        setters : {},

        /**
         * Set an attribute on the model
         * @param key
         * @param value
         * @param options
         */
        set : function(key, value, options) {
            var attrs;

            if (typeof key === 'object') {
                attrs = key;
                options = value;
            } else {
                (attrs = {})[key] = value;
            }

            options || (options = {});

            var unset = options.unset;
            var current = this.attributes;
            var keep = _.keys(attrs);
            var changed = [];
            this._previousAttributes = _.clone(this.attributes);

            // Build array of variables to include in this assignment
            if (this.isGuarded) {
                keep = _.difference(keep, this.guarded);
            } else if (this.isFillable) {
                keep = _.intersection(this.fillable, keep);
            }

            // Assign the models ID if given
            if(attrs[this.idAttribute]) this[this.idAttribute] = attrs[this.idAttribute];

            for(var attr in attrs) {
                if (keep.indexOf(attr) !== -1) {
                    changed.push(attr);

                    if (this.setters[attr] && typeof this.setters[attr] === "function") {
                        attrs[attr] = this.setters[attr](attrs[attr]);
                    }

                    if (this.cast[attr]) {
                        var castTo = "castTo" + this.cast[attr];

                        if (typeof this[castTo] === 'function') {
                            attrs[attr] = this[castTo](attrs[attr]);
                        }
                    }

                    unset ? delete current[attr] : current[attr] = attrs[attr];
                }
            }

            if ( ! this.uid ) {
                this.uid = _.uniqueId('u');
            } else {
                this.changed = this.changed.concat(changed);
            }

            return this;
        },

        /**
         * Get an attribute from the model
         * @param attr
         * @returns {*}
         */
        get : function(attr) {
            var getters = this.getters[attr];

            if (getters && typeof getters === "function") {
                return getters(this.attributes[attr]);
            }

            return this.attributes[attr];
        },

        /**
         * Parse a response
         * @param response
         * @param options
         * @returns {*}
         */
        parse : function(response, options) {
            return response;
        },

        /**
         * Sync the model with the server
         */
        sync : function() {
            return Model.$http.apply(this, arguments);
        },

        /**
         * Fetch this model from the API
         * @param options
         * @returns {*}
         */
        fetch: function(options) {
            options = _.extend({parse: true}, options);
            var model = this;
            var success = options.success || _.noop();

            return this.sync('read', this, options).then(function(response) {
                var path = model.path || "data";

                var serverAttrs = options.parse ? model.parse(Model.helpers.object_path(response, path), options) : response;

                if ( ! model.set(serverAttrs, options)) {
                    return false;
                }

                success instanceof Function && success.call(options.context, model, response, options);

                return model;
            });
        },

        /**
         * Check if an attribute is non-null or not-undefined
         * @param attr
         * @returns {boolean}
         */
        has : function(attr) {
            return this.get(attr) != null;
        },

        /**
         * Check if an attribute has changed
         * @param attr
         */
        hasChanged : function(attr) {
            var changed = this.changed;

            return changed.indexOf(attr) !== -1
        },

        /**
         * Check if the model is new
         * @returns {boolean}
         */
        isNew : function() {
            return ! this.attributes[this.idAttribute];
        },

        /**
         *
         * @param attr
         * @param options
         * @returns {*}
         */
        unset : function(attr, options) {
            var attrs = attr;
            if (typeof attrs !== 'object') {
                (attrs = {})[attr] = void 0;
            }

            return this.set(attrs, _.extend({}, options, {unset: true}));
        },

        /**
         * Return an HTML escaped attribute
         * @param attr
         * @returns {string}
         */
        escape : function(attr) {
            return _.escape(this.get(attr));
        },

        /**
         * Return the model as a JSON string
         */
        toJson : function() {
            return JSON.stringify(_.clone(this.attributes));
        },

        /**
         * Return the model as an object
         * @returns {{}|*}
         */
        toObject : function() {
            return this.attributes;
        },

        /**
         * Get the url for the model
         * @returns {*}
         */
        url: function() {
            var base =
                _.result(this, 'urlRoot') ||
                _.result(this.collection, 'url') ||
                Model.helpers.urlError();
            if (this.isNew()) return base;
            var id = this.get(this.idAttribute);
            return base.replace(/[^\/]$/, '$&/') + encodeURIComponent(id);
        },

        /**
         * Cast a value to an integer
         * @param value
         * @returns {Number|*}
         */
        castToInt : function(value) {
            return parseInt(value, 10);
        },

        /**
         * Cast a value to a string
         * @param value
         * @returns {*}
         */
        castToString : function(value) {
            return value.toString();
        },

        /**
         * Cast a value to a boolean
         * @param value
         */
        castToBool : function(value) {
            return (value === 'false' || value === '0') ? false : !! value;
        },

        /**
         * Cast a value to a Date object (RFC2822 compliant)
         * @param value
         */
        castToDate : function(value) {
            return new Date(value);
        }
    });

})(angular);
(function(angular, factory) {

    angular.module('daveawb.angularModels')
        .factory('daveawbSync', ["$http", "daveawbHelpers", factory]);

}(angular, function($http, helpers) {

    return function(method, model, options) {

        var methodMap = {
            'create': 'POST',
            'update': 'PUT',
            'patch':  'PATCH',
            'delete': 'DELETE',
            'read':   'GET'
        };

        options || (options = {});

        var type = methodMap[method],
            request = { method : type, dataType : 'json' };

        request.url = _.result(model, 'url') || helpers.urlError();

        return $http(_.extend(request, options));
    }

}));