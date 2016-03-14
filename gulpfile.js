var gulp = require('gulp'),
    uglify = require('gulp-uglifyjs'),
    sourcemaps = require('gulp-sourcemaps'),
    Server = require('karma').Server;

gulp.task('test', function(done) {
    new Server({
        configFile: __dirname + '/spec/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('start', function(done) {
    new Server({
        configFile: __dirname + '/spec/karma.conf.js',
        singleRun: false
    }, done).start();
});

gulp.task('compile:polyfills', function() {
    gulp
        .src([
            'public/vendors/traceur/traceur.min.js',
            'public/vendors/es6-shim/es6-shim.min.js',
            'public/vendors/es6-module-loader/dist/es6-module-loader.js',
            'public/vendors/fetch/fetch.js'
        ])
        .pipe(sourcemaps.init())
        .pipe(uglify('es6-starter.min.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./lib'));
});

gulp.task('default', ['test']);
