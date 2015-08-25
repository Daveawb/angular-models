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
        options || (options = {});
        this.attributes = {};
        if (options.collection) this.collection = options.collection;
        if (options.parse) attrs = this.parse(attrs, options) || {};
        this.options = options;
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

    var modelMethods = { keys: 1, values: 1, pairs: 1, invert: 1, pick: 0,
        omit: 0, chain: 1, isEmpty: 1 };

    addLodashMethods(Model, modelMethods, 'attributes');

})(angular);