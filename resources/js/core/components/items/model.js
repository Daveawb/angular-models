var Service = function(Model) {
    return Model.extend({
        fillable : ["name", "value", "short_description"]
    });
}

Service.$inject = ['Model'];

module.exports = Service;