module.exports = ['$scope', '$rootScope', 'items' , function($scope, $rootScope, items) {

    // The items model
    $scope.items = items;

    $scope.swapName = function(item) {
        item.set('name', 'Swapped!');
    }

}];