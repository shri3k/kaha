var gulp = require('gulp');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');

gulp.task('build-css', function() {
  return gulp.src(['public/lib/ionic/css/ionic.css', 'public/css/style.css'])
    .pipe(concat('app.min.css'))
    .pipe(minifyCss())
    .pipe(gulp.dest('public/dist/css'));
});