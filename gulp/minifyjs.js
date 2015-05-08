var gulp = require('gulp');
var ngAnnotate = require('gulp-ng-annotate');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourceMaps = require('gulp-sourcemaps');
var runSequence = require('run-sequence');
var webpack = require('gulp-webpack');

/**
 * Builds JS files for dev work
 */
gulp.task('webpack-dev', function(){
  return gulp.src('./no_op.js')
    .pipe(webpack(require('./webpack_dev_config.js')))
    .pipe(gulp.dest('public/js'));
});

/**
 * Builds JS files for prod
 */
gulp.task('webpack-prod', function(){
  return gulp.src('./no_op.js')
    .pipe(webpack(require('./webpack_prod_config.js')))
    .pipe(gulp.dest('public/dist/js'));
});

/**
 * Concat ionic to bundle.min.js
 */
gulp.task('concat-js', function () {
    return gulp.src(['public/lib/ionic/js/ionic.bundle.min.js', 'public/dist/js/bundle.min.js'])
         .pipe(concat('bundle.min.js'), {newLines: ';'})
         .pipe(gulp.dest('public/dist/js'));
});

/**
 * Run's webpack-prod to minify app js files and concats ionic.bundle.min.js
 */
gulp.task('build-js', function () {
    runSequence('webpack-prod', 'concat-js', function (err) {
        if (err) {
            console.log(err);
            return;
        }
    });
});