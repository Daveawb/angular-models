var Controller = function($scope, $rootScope) {
    $scope.$watch('search', function(value) {
        $rootScope.$emit('search', value);
    });
}

Controller.$inject = ['$scope', '$rootScope'];

module.exports = Controller;