var Animation = function($animateCss) {
    return {
        addClass : function(element, done) {
            return $animateCss(element, {
                from: { top: 0 },
                easing : 'easeOut',
                to: { top: '-50px'},
                duration: 0.4 // one second
            });
        },

        removeClass : function(element, done) {
            return $animateCss(element, {
                from: { top: "-50px" },
                to: { top:0 },
                easing : 'easeIn',
                duration: 0.4 // one second
            });
        }
    }
}

Animation.$inject = ['$animateCss'];

module.exports = Animation;