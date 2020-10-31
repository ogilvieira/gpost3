const gulp = require("gulp");
const livereload = require("gulp-livereload");
const sass = require("gulp-sass");
const wait = require("gulp-wait");
const nodemon = require("gulp-nodemon");


function swallowError(error) {
  console.log(error.toString());
  this.emit("end");
}

const paths = {
  styles: {
    src: ["src/sass/style.scss"],
    src_all: "src/sass/**/*.scss",
    dest: "public/assets/",
  }
};

function styles() {
  return gulp
    .src(paths.styles.src)
    .pipe(wait(500))
    .pipe(
      sass({
        outputStyle: "compressed",
        sourceComments: false,
        allowEmpty: true,
        sourceMap: true,
      }).on("error", sass.logError)
    )
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(livereload());
}

var buildDev = gulp.series(styles);

function watch() {
  nodemon({
    restartable: "rs",
    ignore: ["src/**/*", "app/public/**/*"],
    verbose: false,
    execMap: {
      js: "node",
    },
    watch: ["app/**/*"],
    events: {
      start: "echo 'Server started'",
      restart: "echo 'Server started'",
      crash: "echo 'Server failed to start :((((((((((((((('",
    },
    ext: "js",
  });

  buildDev();
  livereload.listen();
  gulp.watch(paths.styles.src_all, gulp.series(styles));
  // gulp.watch(paths.scripts.src_all, { debounceDelay: 1000 }, scripts);
}

exports.buildDev = buildDev;
exports.watch = watch;
exports.styles = styles;
