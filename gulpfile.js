const gulp = require("gulp");
const livereload = require("gulp-livereload");
const sass = require("gulp-sass");
const wait = require("gulp-wait");
const nodemon = require("gulp-nodemon");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const uglify = require("gulp-uglify-es").default;
const envify = require("envify/custom");
const vueify = require("vueify");
const babel = require("babelify");
const sourcemaps = require("gulp-sourcemaps");

require('dotenv').config();

vueify.compiler.applyConfig({
  runtimeCompiler: true,
});


function swallowError(error) {
  console.log(error.toString());
  this.emit("end");
}

const paths = {
  styles: {
    src: ["src/sass/style.scss"],
    src_all: "src/sass/**/*.scss",
    dest: "public/assets/",
  },
  scripts: {
    src: "src/js/entry.js",
    src_all: ["src/js/**/*.js", "src/js/**/*.vue"],
    dest: "public/assets/",
  }
};


function scripts() {
  var b = browserify({
    entries: paths.scripts.src,
    insertGlobals: true,
    debug: true,
    baseDir: ".",
  });

  return b
    .transform(vueify)
    .transform(
      { global: true },
      envify({ NODE_ENV: process.env.NODE_ENV || "development" })
    )
    .transform(
      babel.configure({
        presets: ["@babel/preset-env"]
      })
    )
    .bundle()
    .on("error", swallowError)
    .pipe(source("script.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify())
    .on("error", swallowError)
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(livereload());
}


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

var buildDev = gulp.series(styles, scripts);

function watch() {
  nodemon({
    restartable: "rs",
    ignore: ["src/**/*", "public/**/*"],
    verbose: false,
    execMap: {
      js: "node",
    },
    watch: ["app.js","AuthGuard.js", "core/**/*", "install/**/*", "rest/**/*", "ui/**/*"],
    events: {
      start: "echo 'Server started'",
      restart: "echo 'Server started'",
      crash: "echo 'Server failed to start :((((((((((((((('",
    },
    ext: "js,ejs",
  });

  buildDev();
  livereload.listen();
  gulp.watch(paths.styles.src_all, gulp.series(styles));
  gulp.watch(paths.scripts.src_all, { debounceDelay: 1000 }, scripts);
}

exports.buildDev = buildDev;
exports.watch = watch;
exports.styles = styles;
exports.scripts = scripts;
