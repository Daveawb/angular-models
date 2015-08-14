var Directive = function($animate) {
    return {
        restrict: 'EA',
        replace: true,
        controller : "SubnavCtrl",
        controllerAs : "subnav",
        templateUrl : "core/directives/subnav/view.html",
        link : function(scope, element, attrs) {

        }
    };
}

Directive.$inject = ['$animate'];

module.exports = Directive;