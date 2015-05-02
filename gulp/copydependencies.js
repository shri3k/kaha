var gulp = require('gulp');

gulp.task('copy-fonts', function() {
	return gulp.src('public/lib/ionic/fonts/*.*')
		.pipe(gulp.dest('public/dist/fonts'));
});

gulp.task('copy-js-sourcemaps', function() {
	return gulp.src('public/lib/ionic/js/*.js.map')
		.pipe(gulp.dest('public/dist/js'));
});

gulp.task('build-deps', ['copy-fonts', 'copy-js-sourcemaps']);