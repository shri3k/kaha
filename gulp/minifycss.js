var gulp = require('gulp');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var sourceMaps = require('gulp-sourcemaps');

gulp.task('build-css', function() {
  return gulp.src(['public/lib/ionic/css/ionic.css', 'public/css/style.css'])
    .pipe(concat('app.min.css'))
    .pipe(sourceMaps.init())
    .pipe(minifyCss())
    .pipe(sourceMaps.write('./'))
    .pipe(gulp.dest('public/dist/css'));
});