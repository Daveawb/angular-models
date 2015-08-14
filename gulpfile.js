process.env.DISABLE_NOTIFIER = true;

var elixir = require('laravel-elixir');

require('laravel-elixir-browser-sync');
require('./.gulp/template');

/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Less
 | file for our application, as well as publishing vendor resources.
 |
 */

elixir(function(mixr) {
    mixr.sass('app.scss')
        .copy('./resources/vendor/fontawesome/fonts', './public/fonts')
        .browserify('app.js', 'public/js/app.js', 'resources/js', {
            transform : ['debowerify']
        })/*
        .browserify('global.js', 'public/js/global.js', 'resources/js', {
            transform : ['debowerify']
        })*/
        .templateCache('/**/*.html', 'public/js/templates.js', 'resources/js', {
            module : 'Sandbox'
        })
        .browserSync([
            'public/js/app.js',
            'public/js/global.js',
            'public/js/templates.js',
            'public/css/**/*.css',
            'resources/views/**/*.php',
        ], {
            proxy: 'sandbox.dev'
        });
});
