angular.module('Sandbox', [
    'ngAnimate',
    'ngResource',
    'ui.bootstrap',
    'ui.router',
    'pc035860.scrollWatch',
    require('./core'),
    require('./views')
])

.config([
    '$locationProvider',
    '$urlRouterProvider',
    function($locationProvider, $urlRouterProvider) {

        $locationProvider.html5Mode(true);

        $urlRouterProvider.otherwise('/');
    }
]);

