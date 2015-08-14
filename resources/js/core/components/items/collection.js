var Collection = function(Items, Model) {
    var col,
        Col = Items.extend({
            url : "/items",
            model : Model,
            path : "data"
        });

    return {
        collection : function() {
            if ( ! col ) {
                col = new Col();
            }
            return col;
        }
    }
}

Collection.$inject = ['Collection', 'ItemModel'];

module.exports = Collection;