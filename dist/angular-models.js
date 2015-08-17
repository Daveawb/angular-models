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
}
(function(angular) {
    angular.module('daveawb.angularModels', []);
})(angular);
(function (angular) {

    angular.module('daveawb.angularModels')
        .factory('daveawbExtender', Extender);

    /**
     * This service creates a constructor that allows a class to be extended using
     * a static method defined on the core class.
     *
     * @example
     * function aConstructor() { ... };
     * aConstructor.extend = Extender();
     *
     * @returns {Function}
     * @constructor
     */
    function Extender () {
        return function (protoProps, staticProps) {
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
    };
})(angular);
(function(angular) {
    angular.module('daveawb.angularModels')
        .factory('daveawbCollection', Service);


    /**
     * The factory wrapper for DI
     * @param $http
     * @param $extender
     * @returns {Object}
     * @constructor
     */
    function Service(extender, $http) {

        Collection.extend = extender;
        Collection.http = $http;

        return Collection;
    }

    Service.$inject = ["daveawbExtender", "$http"];

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

    Collection.prototype = {

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
                    var model = new Model(value, options);
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

            if (!url) {
                throw new Error("A URL must be defined.");
            }

            this.preFetch();

            if (id) {
                url = url.split('/');
                url.push(id)
                url = url.join('/');
            }

            return Collection.http.get(url).then(function (response) {
                response = self.postFetch(response);
                var data = self.path ? stringPath(response.data, self.path) : response.data;
                self.set(data);
                return self;
            });
        },

        /**
         * A hook to modify the collection pre fetch
         */
        preFetch: function () {
            //
        },

        /**
         * A hook to set alternative data on the collection from a response
         * @param data
         * @returns {boolean}
         */
        postFetch: function (response) {
            return response;
        }
    }
})(angular);
(function(angular) {

    angular.module('daveawb.angularModels')
        .service('daveawbModel', ModelService);

    /**
     * The service wrapper for DI
     * @param $http
     * @param $extender
     * @returns {Object}
     * @constructor
     */
    function ModelService(extender) {
        Model.extend = extender;
        return Model;
    }

    ModelService.$inject = ["daveawbExtender"]

    /**
     * A generic model
     * @constructor
     * @param attributes
     * @param options
     */
    function Model(attributes, options) {
        var attrs = attributes || {};
        this.attributes = {};
        this.options = options;
        this.isGuarded  = _.isArray(this.guarded);
        this.isFillable = ! this.isGuarded && _.isArray(this.fillable);
        attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
        this.set(attrs, options);
    }

    Model.prototype = {

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
    }

})(angular);