module.exports = 'Core';

var dependencies = [
    'ui.router',
    'ngAnimate',
    require('./components'),
    require('./directives/navbar'),
    require('./directives/subnav')
];

angular.module(module.exports, dependencies)
    .controller('Jumbotron', require('./views/jumbotron/controller'))
    .factory('extender', require('./services/extender'))
    .service('Model', require('./services/model'))
    .service('Collection', require('./services/collection'))

    .config([
        '$stateProvider',
        function($stateProvider) {

            $stateProvider.state('main', {
                abstract : true,
                views : {
                    'navbar@' : {
                        template : "<navbar></navbar>"
                    },
                    'jumbotron@' : {
                        templateUrl : 'core/views/jumbotron/view.html',
                        controller : 'Jumbotron as jumbo'
                    },
                    'subnav@' : {
                        template : "<div class=\"container-fluid\"><subnav></subnav></div>"
                    }
                }
            });
        }
    ]);