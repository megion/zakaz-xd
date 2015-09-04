var fs = require('fs');
var gulp = require('gulp');
var del = require('del');
var less = require('gulp-less');

var config = require('./build.config.json');

gulp.task('default', ['build']);
gulp.task('build', ['vendor-js', 'vendor-css', 'vendor-fonts', 'build-less']);

/* cleans */
gulp.task('vendor-clean', function(cb) {
    del([config.build_dir + '/vendor'], cb);
});
gulp.task('vendor-js-clean', function(cb) {
    del([config.build_dir + '/vendor/js'], cb);
});
gulp.task('vendor-css-clean', function(cb) {
    del([config.build_dir + '/vendor/css'], cb);
});
gulp.task('vendor-fonts-clean', function(cb) {
    del([config.build_dir + '/vendor/fonts'], cb);
});
gulp.task('css-clean', function(cb) {
    del([config.build_dir + '/css'], cb);
});
gulp.task('clean', function(cb) {
  del([config.build_dir], cb);
});

/* copy vendors files */
gulp.task('vendor-js', ['vendor-js-clean'], function() {
    gulp.src(config.vendor_files.js)
        .pipe(gulp.dest(config.build_dir + '/vendor/js'))
});
gulp.task('vendor-css', ['vendor-css-clean'], function() {
    gulp.src(config.vendor_files.css)
        .pipe(gulp.dest(config.build_dir + '/vendor/css'))
});
gulp.task('vendor-fonts', ['vendor-fonts-clean'], function() {
    gulp.src(config.vendor_files.fonts)
        .pipe(gulp.dest(config.build_dir + '/vendor/fonts'))
});

gulp.task('build-less', ['css-clean'], function () {
    return gulp.src('./less/**/*.less')
        .pipe(less())
        .pipe(gulp.dest(config.build_dir + '/css'));
});

var handleError = function (err) {
  console.log(err.toString());
  this.emit('end');
};