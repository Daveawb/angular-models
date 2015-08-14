var elixir      = require('laravel-elixir');
var gulp        = require("gulp");
var gulpif      = require("gulp-if");
var insert      = require("gulp-insert");
var utilities   = require('laravel-elixir/ingredients/commands/Utilities');
var template    = require('gulp-angular-templatecache');

/**
 * Calculate the correct save destination.
 *
 * @param {string} output
 */
var getDestination = function(output) {
    var parsed = utilities.parse(output);

    return {
        fileName: parsed.name || 'template.js',
        dir: parsed.baseDir
    }
};

/*
 |----------------------------------------------------------------
 | Angular Template Cache Task
 |----------------------------------------------------------------
 |
 | This task will manage your entire Browserify workflow, from
 | scratch! Also, it will channel all files through Babelify
 | so that you may use all the ES6 goodness you can stand.
 |
 */

elixir.extend('templateCache', function(src, output, baseDir, options) {
    baseDir = baseDir || elixir.config.assetsDir + 'js';
    src     = utilities.buildGulpSrc(src, './' + baseDir);

    utilities.logTask('Running template cache', src);

    gulp.task('templateCache', function() {
        gulp.src(src)
            .pipe(template(options))
            .pipe(gulpif(options.wrap, insert.wrap('(function(angular) {', '})(angular);')))
            .pipe(gulp.dest(getDestination(output || this.jsOutput).dir));
    })

    return this
        .registerWatcher('templateCache', src)
        .queueTask('templateCache');
});