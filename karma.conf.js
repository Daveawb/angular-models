// Karma configuration
// Generated on Sat Jun 20 2015 09:22:23 GMT+0100 (BST)
module.exports = function(config) {
    config.set({
        browsers: ['PhantomJS'],
        frameworks: ['jasmine'],
        files: [
            'bower_components/lodash/lodash.min.js',
            'bower_components/angular/angular.min.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'build/module.js',
            'build/**/*.js',
            'tests/**/*Spec.js'
        ]
    });
};