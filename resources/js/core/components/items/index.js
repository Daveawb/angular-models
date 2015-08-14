module.exports = "Components.Items";

angular.module(module.exports, [])
    .service('ItemModel', require('./model'))
    .factory('ItemCollection' , require('./collection'));