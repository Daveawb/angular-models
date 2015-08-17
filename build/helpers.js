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

/**
 *
 * @param length
 * @param method
 * @param attribute
 * @returns {Function}
 */
function addMethod(length, method, attribute) {
    switch (length) {
        case 1: return function() {
            return _[method](this[attribute]);
        };
        case 2: return function(value) {
            return _[method](this[attribute], value);
        };
        case 3: return function(iteratee, context) {
            return _[method](this[attribute], iteratee, context);
        };
        case 4: return function(iteratee, defaultVal, context) {
            return _[method](this[attribute], iteratee, defaultVal, context);
        };
        default: return function() {
            var args = slice.call(arguments);
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
    _.each(methods, function(length, method) {
        if (_[method]) Class.prototype[method] = addMethod(length, method, attribute);
    });
};