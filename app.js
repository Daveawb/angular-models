(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

angular.module('Sandbox', ['ngAnimate', 'ngResource', 'ui.bootstrap', 'ui.router', 'pc035860.scrollWatch', require('./core'), require('./views')]).config(['$locationProvider', '$urlRouterProvider', function ($locationProvider, $urlRouterProvider) {

    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise('/');
}]);

},{"./core":5,"./views":13}],2:[function(require,module,exports){
"use strict";

module.exports = "Components";

angular.module(module.exports, [require("./items")]);

},{"./items":3}],3:[function(require,module,exports){
'use strict';

module.exports = 'Components.Items';

angular.module(module.exports, []).service('ItemModel', require('./model')).factory('ItemCollection', ['ItemModel', function (ItemModel) {
    return {
        items: [],
        get: function get(data) {
            var collection = [];
            data.forEach(function (value, key) {
                collection.push(new ItemModel(value));
            });
            this.items = collection;
        }
    };
}]);

},{"./model":4}],4:[function(require,module,exports){
"use strict";

var Service = function Service(Model) {
    return Model.extend({
        fillable: ["name", "value"]
    });
};

Service.$inject = ["Model"];

module.exports = Service;

},{}],5:[function(require,module,exports){
'use strict';

module.exports = 'Core';

var dependencies = ['ui.router', 'ngResource', require('./components')];

angular.module(module.exports, dependencies).controller('Navbar', require('./views/navbar/controller')).controller('Jumbotron', require('./views/jumbotron/controller')).controller('Filters', require('./views/filters/controller'))
//.directive('digestCount', require('./dev/digest-count'))
.factory('ItemsResource', require('./resources/items')).service('Model', require('./services/model')).service('Collection', require('./services/collection')).factory('extender', require('./services/extender')).config(['$stateProvider', function ($stateProvider) {

    $stateProvider.state('main', {
        abstract: true,
        views: {
            'navbar@': {
                templateUrl: 'core/views/navbar/view.html',
                controller: 'Navbar'
            },
            'jumbotron@': {
                templateUrl: 'core/views/jumbotron/view.html',
                controller: 'Jumbotron as jumbo'
            },
            'filters@': {
                templateUrl: 'core/views/filters/view.html',
                controller: 'Filters as filters'
            }
        }
    });
}]);

},{"./components":2,"./resources/items":6,"./services/collection":7,"./services/extender":8,"./services/model":9,"./views/filters/controller":10,"./views/jumbotron/controller":11,"./views/navbar/controller":12}],6:[function(require,module,exports){
'use strict';

module.exports = ['$resource', '$q', '$timeout', function ($resource, $q, $timeout) {
    var resource = $resource('/items/:id', { id: '@id' }, {
        'index': { method: 'GET', params: {
                page: '@page',
                search: '@page'
            }, isArray: false },
        'show': { method: 'GET', isArray: false }
    });

    var response = {
        current_page: 0,
        last_page: 1
    };

    var _search = '';

    var timeout = false;

    var model = function model() {
        return {
            data: [],
            loadingNext: false,
            loadingPrevious: false,
            next: function next() {
                var dfrd = $q.defer(),
                    self = this;

                if (response.current_page < response.last_page) {
                    this.loadingNext = true;

                    resource.index({ page: response.current_page + 1, search: _search }, function (res) {
                        response = res;

                        self.data = self.data.concat(res.data);

                        dfrd.resolve(self);
                    });
                } else {
                    dfrd.resolve(self);
                }

                return dfrd.promise;
            },
            previous: function previous() {
                var dfrd = $q.defer(),
                    self = this;

                if (response.current_page >= 1) {
                    this.loadingNext = true;

                    resource.index({ page: response.current_page - 1 }, function (res) {
                        response = res;

                        self.data = res.data.concat(self.data);

                        self.loadingPrevious = false;

                        dfrd.resolve(self);
                    });
                } else {
                    dfrd.resolve(self);
                }

                return dfrd.promise;
            },

            search: function search(value) {
                _search = value;

                var dfrd = $q.defer(),
                    self = this;

                this.loadingNext = true;

                if (timeout) {
                    $timeout.cancel(timeout);
                    timeout = false;
                }

                timeout = $timeout(function () {
                    resource.index({ page: 1, search: _search }, function (res) {
                        response = res;

                        self.data = res.data;

                        dfrd.resolve(self);
                    });
                }, 500);

                return dfrd.promise;
            }
        };
    };

    return function () {
        return model();
    };
}];

},{}],7:[function(require,module,exports){
"use strict";

var Collection = function Collection(models, options) {
    options || (options = {});
    this.set(data, options);
};

Collection.prototype = {

    model: null,

    _models: [],

    set: function set(data, options) {
        var self = this,
            Model = Collection.baseModel;

        if (this.model) {
            Model = this.model;
        }

        options.collection = self;

        _.each(data, function (value) {
            self._models.push(new Model(value, options));
        });

        return this;
    }
};

/**
 * The service wrapper for DI
 * @param $http
 * @param $extender
 * @returns {Function}
 * @constructor
 */
var Service = function Service(extender, Model) {
    Collection.extend = extender;
    Collection.baseModel = Model;
    return Collection;
};

Service.$inject = ["extender", "Model"];

module.exports = Service;

},{}],8:[function(require,module,exports){
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
'use strict';

var Extender = function Extender() {
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
        var Surrogate = function Surrogate() {
            this.constructor = child;
        };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate();

        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) _.extend(child.prototype, protoProps);

        // Set a convenience property in case the parent's prototype is needed
        // later.
        child.__super__ = parent.prototype;

        return child;
    };
};

module.exports = Extender;

},{}],9:[function(require,module,exports){
'use strict';

var $extender = require('./extender');

/**
 * A generic model
 * @constructor
 * @param attributes
 * @param options
 */
var Model = function Model(attributes, options) {
    var attrs = attributes || {};
    this.attributes = {};
    this.options = options;
    this.isGuarded = _.isArray(this.guarded);
    this.isFillable = !this.isGuarded && _.isArray(this.fillable);
    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
    this.set(attrs, options);
};

Model.prototype = {

    /**
     * Attributes to be type cast
     */
    cast: {},

    /**
     * Hash of changed properties
     */
    changed: [],

    /**
     * Internal ID
     */
    uid: null,

    /**
     * Default model values
     */
    defaults: {},

    /**
     * A whitelist of model attributes that can be mass assignable
     */
    fillable: null,

    /**
     * A blacklist of model attributes that are not mass assignable
     */
    guarded: null,

    /**
     * Attribute getters
     */
    getters: {},

    /**
     * The id attribute for this model
     */
    idAttribute: 'id',

    /**
     * Attribute setters
     */
    setters: {},

    /**
     * Set an attribute on the model
     * @param key
     * @param value
     * @param options
     */
    set: function set(key, value, options) {
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
        if (attrs[this.idAttribute]) this[this.idAttribute] = attrs[this.idAttribute];

        for (var attr in attrs) {
            if (keep.indexOf(attr) !== -1) {
                changed.push(attr);

                if (this.setters[attr] && typeof this.setters[attr] === 'function') {
                    attrs[attr] = this.setters[attr](attrs[attr]);
                }

                if (this.cast[attr]) {
                    var castTo = 'castTo' + this.cast[attr];

                    if (typeof this[castTo] === 'function') {
                        attrs[attr] = this[castTo](attrs[attr]);
                    }
                }

                unset ? delete current[attr] : current[attr] = attrs[attr];
            }
        }

        if (!this.uid) {
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
    get: function get(attr) {
        var getters = this.getters[attr];

        if (getters && typeof getters === 'function') {
            return getters(this.attributes[attr]);
        }

        return this.attributes[attr];
    },

    /**
     * Check if an attribute is non-null or not-undefined
     * @param attr
     * @returns {boolean}
     */
    has: function has(attr) {
        return this.get(attr) != null;
    },

    /**
     * Check if an attribute has changed
     * @param attr
     */
    hasChanged: function hasChanged(attr) {
        var changed = this.changed;

        return changed.indexOf(attr) !== -1;
    },

    /**
     *
     * @param attr
     * @param options
     * @returns {*}
     */
    unset: function unset(attr, options) {
        var attrs = attr;
        if (typeof attrs !== 'object') {
            (attrs = {})[attr] = void 0;
        }

        return this.set(attrs, _.extend({}, options, { unset: true }));
    },

    /**
     * Cast a value to an integer
     * @param value
     * @returns {Number|*}
     */
    castToInt: function castToInt(value) {
        return parseInt(value, 10);
    },

    /**
     * Cast a value to a string
     * @param value
     * @returns {*}
     */
    castToString: function castToString(value) {
        return value.toString();
    },

    /**
     * Cast a value to a boolean
     * @param value
     */
    castToBool: function castToBool(value) {
        return value === 'false' || value === '0' ? false : !!value;
    },

    /**
     * Cast a value to a Date object (RFC2822 compliant)
     * @param value
     */
    castToDate: function castToDate(value) {
        return new Date(value);
    }
};

/**
 * The service wrapper for DI
 * @param $http
 * @param $extender
 * @returns {Function}
 * @constructor
 */
var Service = function Service(extender) {
    Model.extend = extender;
    return Model;
};

Service.$inject = ['extender'];

module.exports = Service;

},{"./extender":8}],10:[function(require,module,exports){
'use strict';

module.exports = ['$scope', '$rootScope', function ($scope, $rootScope) {
    $scope.$watch('search', function (value) {
        $rootScope.$emit('search', value);
    });
}];

},{}],11:[function(require,module,exports){
/**
 * Created by david on 06/06/15.
 */
'use strict';

module.exports = ['$scope', function ($scope) {}];

},{}],12:[function(require,module,exports){
'use strict';

var Controller = function Controller($scope) {
    $scope.isCollapsed = true;
};

Controller.$inject = ['$scope'];

module.exports = Controller;

},{}],13:[function(require,module,exports){
'use strict';

module.exports = 'Views';

angular.module(module.exports, [require('./items')]);

},{"./items":15}],14:[function(require,module,exports){
'use strict';

module.exports = ['$scope', '$rootScope', 'items', function ($scope, $rootScope, items) {

    // The items model
    $scope.items = items;

    $scope.swapName = function (item) {
        item.set('name', 'Swapped!');
    };
}];

},{}],15:[function(require,module,exports){
'use strict';

angular.module('Items', []).controller('ItemsController', require('./controller')).config(['$stateProvider', function ($stateProvider) {

    $stateProvider.state('main.items', {
        url: '/',
        views: {
            '@': {
                controller: 'ItemsController',
                templateUrl: 'views/items/view.html',
                resolve: {
                    items: ['ItemCollection', 'ItemsResource', function (ItemCollection, ItemsResource) {
                        return ItemsResource().next().then(function (resource) {
                            ItemCollection.get(resource.data);
                            return ItemCollection.items;
                        });
                    }]
                }
            }
        }
    });
}]);

module.exports = 'Items';

},{"./controller":14}]},{},[1]);
