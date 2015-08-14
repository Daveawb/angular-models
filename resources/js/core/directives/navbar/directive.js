var Directive = function($animate) {
    return {
        restrict: 'EA',
        replace: true,
        controller : "NavbarCtrl",
        controllerAs : "navbar",
        templateUrl : "core/directives/navbar/view.html",
        link : function(scope, element, attrs) {

            scope.$on('navbar scrolling', function($event, active, locals) {
                var has = element.hasClass('inactive');

                if ( has && locals.$direction == -1 ) {
                    $animate.removeClass(element, 'inactive');
                    scope.$apply();
                } else if( ! has && locals.$direction == 1) {
                    $animate.addClass(element, 'inactive');
                    scope.$apply();
                }
            });
        }
    };
}

Directive.$inject = ["$animate"];

module.exports = Directive;