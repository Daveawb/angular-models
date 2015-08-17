var gulp = require('gulp');
var Server = require('karma').Server;
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var inSequence = require('run-sequence');

var sourceFiles = [
    'build/helpers.js',
    'build/module.js',
    'build/extender.js',
    'build/collection.js',
    'build/model.js'
];

/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('test:tdd', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js'
    }, done).start();
});

gulp.task('test:dist', function(done) {
    new Server({
        configFile: __dirname + '/karmaDist.conf.js',
        singleRun: true
    }, done).start();
})

gulp.task('dist', function(done) {
    return inSequence(['unminified', 'minified', 'test:dist']);
});

gulp.task('unminified', function(done) {
    return gulp.src(sourceFiles)
        .pipe(concat('angular-models.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('minified', function(done) {
    return gulp.src(sourceFiles)
        .pipe(concat('angular-models.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['tdd']);