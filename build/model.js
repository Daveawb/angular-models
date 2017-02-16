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
         * Persist a model with the server
         * @param options
         */
        save : function(key, value, options) {
            var attrs;
            var model = this;

            if (key == null || typeof key === 'object') {
                attrs = key;
                options = value;
            } else {
                (attrs = {})[key] = value;
            }

            options = _.extend({parse: true}, options);

            if (attrs && ! this.set(attrs, options)) {
                return false;
            }

            return this.sync(this.isNew() ? 'create' : 'update', this, options).then(function(response) {

                var data = options.parse ? model.parse(response) : response.data;

                if (! model.set(data.data, options)) {
                    return false;
                }

                return response;
            }).then(options.success || _.noop());
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
                var data = model.path ? Model.helpers.object_path(response.data, model.path) : response.data;
                var serverAttrs = options.parse ? model.parse(data, options) : response;

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
        castToInt : function(value, radix) {
            radix = (radix || 10);
            return parseInt(value, radix);
        },

        /**
         * Cast a value to a string
         * @param value
         * @returns {*}
         */
        castToString : function(value) {
            return (typeof value.toString === 'function') ? value.toString() : value;
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