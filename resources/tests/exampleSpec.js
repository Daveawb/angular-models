describe('Navbar', function() {
    var $controller;

    beforeEach(angular.mock.module('Sandbox'));
    beforeEach(angular.mock.inject(function(_$controller_){
        $controller = _$controller_;
    }));

    it('should always start collapsed', function () {
        var $scope = {};
        var controller = $controller('Navbar', { $scope: $scope });
        expect($scope.isCollapsed).toBe(true);
    });
});