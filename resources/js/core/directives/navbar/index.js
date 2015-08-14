module.exports = "ET.Navbar";

angular.module(module.exports, ['ngAnimate'])
    .animation('.inactive', require('./animations/inactive'))
    .controller('NavbarCtrl', require('./controller'))
    .directive('navbar', require('./directive'));