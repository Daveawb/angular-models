(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

angular.module('Sandbox', ['ngAnimate', 'ngResource', 'ui.bootstrap', 'ui.router', 'pc035860.scrollWatch', require('./core'), require('./views')]).config(['$locationProvider', '$urlRouterProvider', function ($locationProvider, $urlRouterProvider) {

    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise('/');
}]);

},{"./core":14,"./views":19}],2:[function(require,module,exports){
"use strict";

module.exports = "Components";

angular.module(module.exports, [require("./items")]);

},{"./items":4}],3:[function(require,module,exports){
"use strict";

var Collection = function Collection(Items, Model) {
    var col,
        Col = Items.extend({
        url: "/items",
        model: Model,
        path: "data"
    });

    return {
        collection: function collection() {
            if (!col) {
                col = new Col();
            }
            return col;
        }
    };
};

Collection.$inject = ["Collection", "ItemModel"];

module.exports = Collection;

},{}],4:[function(require,module,exports){
'use strict';

module.exports = 'Components.Items';

angular.module(module.exports, []).service('ItemModel', require('./model')).factory('ItemCollection', require('./collection'));

},{"./collection":3,"./model":5}],5:[function(require,module,exports){
"use strict";

var Service = function Service(Model) {
    return Model.extend({
        fillable: ["name", "value", "short_description"]
    });
};

Service.$inject = ["Model"];

module.exports = Service;

},{}],6:[function(require,module,exports){
'use strict';

var Animation = function Animation($animateCss) {
    return {
        addClass: function addClass(element, done) {
            return $animateCss(element, {
                from: { top: 0 },
                easing: 'easeOut',
                to: { top: '-50px' },
                duration: 0.4 // one second
            });
        },

        removeClass: function removeClass(element, done) {
            return $animateCss(element, {
                from: { top: '-50px' },
                to: { top: 0 },
                easing: 'easeIn',
                duration: 0.4 // one second
            });
        }
    };
};

Animation.$inject = ['$animateCss'];

module.exports = Animation;

},{}],7:[function(require,module,exports){
'use strict';

var Controller = function Controller($scope) {
    $scope.isCollapsed = true;
};

Controller.$inject = ['$scope'];

module.exports = Controller;

},{}],8:[function(require,module,exports){
"use strict";

var Directive = function Directive($animate) {
    return {
        restrict: "EA",
        replace: true,
        controller: "NavbarCtrl",
        controllerAs: "navbar",
        templateUrl: "core/directives/navbar/view.html",
        link: function link(scope, element, attrs) {

            scope.$on("navbar scrolling", function ($event, active, locals) {
                var has = element.hasClass("inactive");

                if (has && locals.$direction == -1) {
                    $animate.removeClass(element, "inactive");
                    scope.$apply();
                } else if (!has && locals.$direction == 1) {
                    $animate.addClass(element, "inactive");
                    scope.$apply();
                }
            });
        }
    };
};

Directive.$inject = ["$animate"];

module.exports = Directive;

},{}],9:[function(require,module,exports){
'use strict';

module.exports = 'ET.Navbar';

angular.module(module.exports, ['ngAnimate']).animation('.inactive', require('./animations/inactive')).controller('NavbarCtrl', require('./controller')).directive('navbar', require('./directive'));

},{"./animations/inactive":6,"./controller":7,"./directive":8}],10:[function(require,module,exports){
"use strict";

var Animation = function Animation($animateCss) {
    return {
        addClass: function addClass(element, done) {
            return $animateCss(element, {
                from: { top: 0 },
                to: { top: "50px" },
                easing: "easeOut",
                duration: 0.4 // one second
            });
        },

        removeClass: function removeClass(element, done) {
            return $animateCss(element, {
                from: { top: "50px" },
                to: { top: 0 },
                easing: "easeIn",
                duration: 0.4 // one second
            });
        }
    };
};

Animation.$inject = ["$animateCss"];

module.exports = Animation;

},{}],11:[function(require,module,exports){
'use strict';

var Controller = function Controller($scope, $rootScope) {
    $scope.$watch('search', function (value) {
        $rootScope.$emit('search', value);
    });
};

Controller.$inject = ['$scope', '$rootScope'];

module.exports = Controller;

},{}],12:[function(require,module,exports){
"use strict";

var Directive = function Directive($animate) {
    return {
        restrict: "EA",
        replace: true,
        controller: "SubnavCtrl",
        controllerAs: "subnav",
        templateUrl: "core/directives/subnav/view.html",
        link: function link(scope, element, attrs) {}
    };
};

Directive.$inject = ["$animate"];

module.exports = Directive;

},{}],13:[function(require,module,exports){
'use strict';

module.exports = 'ET.Subnav';

angular.module(module.exports, []).animation('.navbar-in', require('./animations/navbarin')).controller('SubnavCtrl', require('./controller')).directive('subnav', require('./directive'));

},{"./animations/navbarin":10,"./controller":11,"./directive":12}],14:[function(require,module,exports){
'use strict';

module.exports = 'Core';

var dependencies = ['ui.router', 'ngAnimate', require('./components'), require('./directives/navbar'), require('./directives/subnav')];

angular.module(module.exports, dependencies).controller('Jumbotron', require('./views/jumbotron/controller')).factory('extender', require('./services/extender')).service('Model', require('./services/model')).service('Collection', require('./services/collection')).config(['$stateProvider', function ($stateProvider) {

    $stateProvider.state('main', {
        abstract: true,
        views: {
            'navbar@': {
                template: '<navbar></navbar>'
            },
            'jumbotron@': {
                templateUrl: 'core/views/jumbotron/view.html',
                controller: 'Jumbotron as jumbo'
            },
            'subnav@': {
                template: '<div class="container-fluid"><subnav></subnav></div>'
            }
        }
    });
}]);

},{"./components":2,"./directives/navbar":9,"./directives/subnav":13,"./services/collection":15,"./services/extender":16,"./services/model":17,"./views/jumbotron/controller":18}],15:[function(require,module,exports){
/**
 * Helper function to get nested data from an object using
 * a string dot notated path
 * @param object
 * @param path
 * @returns {*}
 */
'use strict';

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
var Collection = function Collection(models, options) {
    options || (options = {});
    if (options.model) {
        this.model = options.model;
    }
    this.models = [];
    this._byId = {};

    this.set(models, options);
};

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
    set: function set(models, options) {
        var self = this,
            Model = this.model,
            singular = !_.isArray(models);

        options || (options = {});

        models = singular ? models ? [models] : [] : models.slice();

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
    get: function get(obj) {
        if (obj == null) return void 0;
        var id = this.modelId(this._isModel(obj) ? obj.attributes : obj);
        return this._byId[obj] || this._byId[id] || this._byId[obj.uid];
    },

    /**
     * Retrieve the model ID attribute
     * @param attrs
     * @returns {*}
     */
    modelId: function modelId(attrs) {
        return attrs[this.model.prototype.idAttribute || 'id'];
    },

    /**
     * Check the object is a model
     * @param model
     * @returns {boolean}
     * @private
     */
    _isModel: function _isModel(model) {
        return model instanceof this.model;
    },

    /**
     * Fetch data from the API
     */
    fetch: function fetch(id) {
        var self = this;
        var url = this.url;

        if (!url) {
            throw new Error('A URL must be defined.');
        }

        this.preFetch();

        if (id) {
            url = url.split('/');
            url.push(id);
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
    preFetch: function preFetch() {},

    /**
     * A hook to set alternative data on the collection from a response
     * @param data
     * @returns {boolean}
     */
    postFetch: function postFetch(response) {
        return response;
    }
};

/**
 * The factory wrapper for DI
 * @param $http
 * @param $extender
 * @returns {Object}
 * @constructor
 */
var Service = function Service(extender, $http) {

    Collection.extend = extender;
    Collection.http = $http;

    return Collection;
};

Service.$inject = ['extender', '$http'];

module.exports = Service;

//

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
/**
 * A generic model
 * @constructor
 * @param attributes
 * @param options
 */
'use strict';

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
     * Check if the model is new
     * @returns {boolean}
     */
    isNew: function isNew() {
        return !this.attributes[this.idAttribute];
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
 * @returns {Object}
 * @constructor
 */
var Service = function Service(extender) {
    Model.extend = extender;
    return Model;
};

Service.$inject = ['extender'];

module.exports = Service;

},{}],18:[function(require,module,exports){
/**
 * Created by david on 06/06/15.
 */
'use strict';

module.exports = ['$scope', function ($scope) {}];

},{}],19:[function(require,module,exports){
'use strict';

module.exports = 'Views';

angular.module(module.exports, [require('./items')]);

},{"./items":21}],20:[function(require,module,exports){
'use strict';

module.exports = ['$scope', '$rootScope', 'items', function ($scope, $rootScope, items) {

    // The items model
    $scope.items = items;

    $scope.swapName = function (item) {
        item.set('name', 'Swapped!');
    };
}];

},{}],21:[function(require,module,exports){
'use strict';

angular.module('Items', []).controller('ItemsController', require('./controller')).config(['$stateProvider', function ($stateProvider) {

    $stateProvider.state('main.items', {
        url: '/',
        views: {
            '@': {
                controller: 'ItemsController',
                templateUrl: 'views/items/view.html',
                resolve: {
                    items: ['ItemCollection', function (factory) {
                        return factory.collection().fetch();
                    }]
                }
            }
        }
    });
}]);

module.exports = 'Items';

},{"./controller":20}]},{},[1]);
