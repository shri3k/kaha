var gulp = require('gulp');
var ngAnnotate = require('gulp-ng-annotate');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourceMaps = require('gulp-sourcemaps');
var runSequence = require('run-sequence');

gulp.task('ng-annotate', function () {
    return gulp.src(['public/js/app.js', 
                     'public/js/controllers.js', 
                     'public/js/plexusSelect.js',
                     'public/js/services.js'])
        .pipe(sourceMaps.init())
        .pipe(concat('app.min.js', { newLines: ';' }))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(sourceMaps.write('./'))
        .pipe(gulp.dest('public/dist/js'));
});

gulp.task('concat-js', function () {
    return gulp.src(['public/lib/ionic/js/ionic.bundle.min.js', 'public/dist/js/app.min.js'])
         .pipe(concat('app.min.js'), {newLines: ';'})
         .pipe(gulp.dest('public/dist/js'));
});

gulp.task('build-js', function () {
    runSequence('ng-annotate', 'concat-js', function (err) {
        if (err) {
            console.log(err);
            return;
        }
    });
});