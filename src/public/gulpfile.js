var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var del = require('del');
var less = require('gulp-less');
var through2 = require('through2');

var config = require('./build.config.json');

gulp.task('default', ['build']);
gulp.task('build', ['vendor-files', 'less']);

/* cleans */
gulp.task('vendor-clean', function(cb) {
    del([path.join(config.build_dir, config.vendor_dir)], cb);
});
gulp.task('css-clean', function(cb) {
    del([config.build_dir + '/css'], cb);
});
gulp.task('clean', function(cb) {
  del([config.build_dir], cb);
});

/**
 * Copy src files with relative path, for example
 * src file is "bower_components/angular/angular.js" then it will be copied to
 * <destPath> + "bower_components/angular/"
 */
function copyWithRelativePath(srcFiles, destPath) {
    var _count = 0;
    var stream = gulp.src(srcFiles)
        .pipe(
        through2.obj(function(file, enc, next) {
            if (!file.isDirectory()) {
                var relPath = srcFiles[_count];
                var srcPaths = relPath.split('/');
                var newPath;
                if (srcPaths.length > 1) {
                    newPath = relPath.substring(0, relPath.length - srcPaths[srcPaths.length-1].length);
                } else {
                    newPath = relPath;
                }
                file.path = path.join(file.base, newPath, path.basename(file.path));
                this.push(file);
                _count++;
            }
            next();
        }))
        .pipe(gulp.dest(destPath));

    return stream;
};

/* copy vendors files */
gulp.task('vendor-files', ['vendor-clean'], function() {
    copyWithRelativePath(config.vendor_files.js, config.build_dir);
    copyWithRelativePath(config.vendor_files.css, config.build_dir);
    copyWithRelativePath(config.vendor_files.fonts, config.build_dir);
});

/**
 * Build app less
 */
gulp.task('less', ['css-clean'], function () {
    return gulp.src('./less/**/*.less')
        .pipe(less())
        .pipe(gulp.dest(config.build_dir + '/css'));
});

var handleError = function (err) {
  console.log(err.toString());
  this.emit('end');
};