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