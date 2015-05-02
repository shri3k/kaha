var gulp = require('gulp');
require('./gulp/minifyjs');
require('./gulp/minifycss');
require('./gulp/copydependencies');

gulp.task('default', ['build-js', 'build-css', 'build-deps']);