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
 * The collection
 * @param models
 * @param options
 * @constructor
 */
var Collection = function(models, options) {
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
    model : null,

    /**
     * Set models on this collection
     * @param models
     * @param options
     * @returns {Collection}
     */
    set : function(models, options) {
        var self = this,
            Model = this.model,
            singular = !_.isArray(models);

        options || (options = {});

        models = singular ? (models ? [models] : []) : models.slice();

        _.each(models, function(value) {
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
    get: function(obj) {
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
    fetch : function(id) {
        var self = this;
        var url = this.url;

        if ( ! url ) {
            throw new Error("A URL must be defined.");
        }

        this.preFetch();

        if (id) {
            url = url.split('/');
            url.push(id)
            url = url.join('/');
        }

        return Collection.http.get(url).then(function(response) {
            response = self.postFetch(response);
            var data = self.path ? stringPath(response.data, self.path) : response.data;
            self.set(data);
            return self;
        });
    },

    /**
     * A hook to modify the collection pre fetch
     */
    preFetch : function() {
        //
    },

    /**
     * A hook to set alternative data on the collection from a response
     * @param data
     * @returns {boolean}
     */
    postFetch : function(response) {
        return response;
    }
}

/**
 * The factory wrapper for DI
 * @param $http
 * @param $extender
 * @returns {Object}
 * @constructor
 */
var Service = function(extender, $http) {

    Collection.extend = extender;
    Collection.http = $http;

    return Collection;
}

Service.$inject = ["extender", "$http"];

module.exports = Service;