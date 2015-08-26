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