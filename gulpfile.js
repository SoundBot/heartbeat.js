'use strict';

var gulp = require('gulp'),
  connect = require('gulp-connect'),
  opn = require('opn'),
  autopolyfiller = require('gulp-autopolyfiller'),
  concat = require('gulp-concat'),
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
    return gulp.src('heartbeat.js')
        .pipe(autopolyfiller('polyfills.js'))
        .pipe(gulp.dest('./'));
});

gulp.task('scripts', function() {
  return gulp.src(['./src/*.js'])
    .pipe(concat('heartbeat.js'))
    .pipe(gulp.dest('./dist/'));
});


gulp.task('watch', function() {
  gulp.watch('./src/*.js', ['scripts', 'autopolyfiller', 'recheck']);
});
gulp.task('serve', ['scripts', 'open', 'watch']);
