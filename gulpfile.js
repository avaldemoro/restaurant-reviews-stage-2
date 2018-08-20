var gulp = require('gulp');
var uglify = require('gulp-uglify');

gulp.task('default', function() {
    console.log('hello there!');
});

gulp.task('js', () => {
  return gulp.src(['js/dbhelper.js', 'js/main.js', 'js/restaurant_info.js'])
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});
