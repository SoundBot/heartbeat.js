
var gulp = require('gulp'),
  connect = require('gulp-connect'),
  opn = require('opn'),
  autopolyfiller = require('gulp-autopolyfiller'),
  concat = require('gulp-concat'),
  wrap = require("gulp-wrap"),
  order = require("gulp-order"),
  uglify = require("gulp-uglify"),
  isDist = process.argv.indexOf('serve') === -1;


gulp.task('connect', function() {
  connect.server({
    root: './',
    livereload: true
  });
});

gulp.task('recheck', function() {
  return gulp.src('*')
    .pipe(connect.reload());
});

gulp.task('open', ['connect'], function (done) {
  opn('http://localhost:8080', done);
});

gulp.task('autopolyfiller', function () {
    return gulp.src('./src/heartbeat.js')
        .pipe(autopolyfiller('polyfills.js'))
        .pipe(gulp.dest('./src'));
});

gulp.task('scripts', ['autopolyfiller'], function() {
  return gulp.src(['./src/*.js'])
    .pipe(order([
      'src/heartbeat.js',
      'src/polyfills.js',
    ]))
    .pipe(concat('heartbeat.js'))
    .pipe(wrap('; (function(window) {<%= contents %>})(window);'))
    .pipe(gulp.dest('./dist/'));
});


gulp.task('watch', function() {
  gulp.watch('./src/*.js', ['scripts', 'autopolyfiller', 'recheck']);
});

gulp.task('serve', ['scripts', 'open', 'watch']);

gulp.task('build', ['scripts'], function() {
  return gulp.src(['./dist/heartbeat.js'])
    .pipe(uglify())
    .pipe(concat('heartbeat.min.js'))
    .pipe(gulp.dest('./dist/'));
});
