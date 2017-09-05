var gulp = require('gulp');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
//var concat = require('gulp-concat');
//var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
//var cleanCSS = require('gulp-clean-css');
var gulpIf = require('gulp-if');
var del = require('del');

var paths = {
    styles: {
        src: 'src/styles/**/*.less',
        dest: 'build/styles/'
    },
    scripts: {
        src: 'src/scripts/**/*.js',
        dest: 'build/scripts/'
    }
};

var isDevelopment = !process.env.NODE_ENV ||
    process.env.NODE_ENV == 'development';

gulp.task('clean', function () {
    // return its promise
    return del([ 'build' ]);
});

gulp.task('assets', function() {
  return gulp.src('src/assets/**')
      .pipe(gulp.dest('build'));
});

gulp.task('styles', function () {
    return gulp.src(paths.styles.src)
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(less())
    //.pipe(cleanCSS())
    // pass in options to the stream
        .pipe(rename({
            basename: 'main'
            //suffix: '.min'
        }))
        .pipe(gulpIf(isDevelopment, sourcemaps.write('.')))
        .pipe(gulp.dest(paths.styles.dest));
});

gulp.task('scripts', function (done) {
    done();
  //return gulp.src(paths.scripts.src, { sourcemaps: true })
    //.pipe(babel())
    //.pipe(uglify())
    //.pipe(concat('main.min.js'))
    //.pipe(gulp.dest(paths.scripts.dest));
});

gulp.task('build', gulp.series(
    'clean',
    gulp.parallel('styles', 'scripts', 'assets'))
);

/*
 * Define default task that can be called by just running `gulp` from cli
 */
 gulp.task('default', gulp.series('build'));
