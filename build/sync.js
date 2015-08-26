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