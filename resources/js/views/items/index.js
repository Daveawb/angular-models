angular.module('Items', [])
    .controller('ItemsController', require('./controller'))

    .config(['$stateProvider', function($stateProvider) {

        $stateProvider.state('main.items', {
            url : '/',
            views : {
                '@' : {
                    controller : 'ItemsController',
                    templateUrl : 'views/items/view.html',
                    resolve : {
                        items : ['ItemCollection', function(factory) {
                            return factory.collection().fetch();
                        }]
                    }
                }
            }
        })
    }]);

module.exports = "Items";