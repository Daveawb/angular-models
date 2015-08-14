module.exports = "ET.Subnav";

angular.module(module.exports, [])
    .animation('.navbar-in', require('./animations/navbarin'))
    .controller('SubnavCtrl', require('./controller'))
    .directive('subnav', require('./directive'));