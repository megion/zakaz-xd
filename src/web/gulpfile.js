var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var header = require('gulp-header');
var footer = require('gulp-footer');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var template = require('gulp-template');

var minifyHtml = require('gulp-minify-html');
var minifyCSS = require('gulp-minify-css');
var templateCache = require('gulp-angular-templatecache');

var plumber = require('gulp-plumber');//To prevent pipe breaking caused by errors at 'watch'
var es = require('event-stream');
var del = require('del');
var less = require('gulp-less');
var through2 = require('through2');

var config = require('./build.config.json');

gulp.task('default', ['build']);
gulp.task('build', ['vendor-files', 'less', 'scripts', 'index']);

/* cleans */
gulp.task('vendor-clean', function(cb) {
    del([path.join(config.build_dir, config.vendor_dir)], cb);
});
gulp.task('css-clean', function(cb) {
    del([config.build_dir + '/css'], cb);
});
gulp.task('js-clean', function(cb) {
    del([config.build_dir + '/js'], cb);
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
gulp.task('less', function () {
    del.sync([config.build_dir + '/zakaz-xd-styles.css']);
    return gulp.src('./src/less/**/*.less')
        .pipe(less())
        .pipe(concat('zakaz-xd-styles.css'))
        .pipe(gulp.dest(config.build_dir));
});

gulp.task('dev-copy-src', function() {
    del.sync([config.build_dir + '/src']);
    return gulp.src('./src/**/*.js')
        .pipe(gulp.dest(config.build_dir + '/src'));
});

gulp.task('compile-templates', function() {
    del.sync([config.build_dir + '/templates-zakaz-xd.js']);
    return gulp.src('./src/app/**/*.tpl.html')
        .pipe(plumber({
            errorHandler: handleError
        }))
        .pipe(minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe(templateCache({module: 'zakaz-xd.main', root: 'app'}))
        .pipe(concat('templates-zakaz-xd.js'))
        .pipe(gulp.dest(config.build_dir));
});

gulp.task('scripts', ['compile-templates'], function() {
    del.sync([config.build_dir + '/zakaz-xd.js',
        config.build_dir + '/zakaz-xd.min.js']);
    // build src scripts
    return gulp.src(['./src/app/**/*.js'])
        .pipe(plumber({
            errorHandler: handleError
        }))
        .pipe(concat('zakaz-xd.js'))
        //.pipe(header('(function () { \n"use strict";\n'))
        //.pipe(footer('\n}());'))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'))
        .pipe(header(config.banner, {
            timestamp: (new Date()).toISOString()
        }))
        .pipe(gulp.dest(config.build_dir))
        // minify
        .pipe(uglify({preserveComments: 'some'}))
        .pipe(rename({ext:'.min.js'}))
        .pipe(gulp.dest(config.build_dir));
});

gulp.task('index', function () {
    del.sync([config.build_dir + '/index.html', config.build_dir + '/_index.html']);
    gulp.src('src/index.html')
        .pipe(template({scripts: []}))
        .pipe(concat('_index.html'))
        .pipe(gulp.dest(config.build_dir))
    return gulp.src('src/index.html')
        .pipe(template({scripts: ['zakaz-xd.js', 'templates-zakaz-xd.js']}))
        .pipe(concat('index.html'))
        .pipe(gulp.dest(config.build_dir));
});

var handleError = function (err) {
  console.log(err.toString());
  this.emit('end');
};