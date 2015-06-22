var fs = require('fs');
var gulp = require('gulp');
var del = require('del');

var config = require('./build.config.json');

gulp.task('default', ['build']);
gulp.task('build', ['scripts', 'styles']);

gulp.task('clean', function(cb) {
  del([config.build_dir], cb);
});

gulp.task('scripts', ['clean'], function() {
    gulp.src(config.vendor_files.js)
        .pipe(gulp.dest(config.build_dir + '/js/vendor'))
});

gulp.task('styles', ['clean'], function() {
    gulp.src(config.vendor_files.css)
        .pipe(gulp.dest(config.build_dir + '/css/vendor'))
});

var handleError = function (err) {
  console.log(err.toString());
  this.emit('end');
};