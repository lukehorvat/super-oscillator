import gulp from "gulp";
import gutil from "gulp-util";
import filter from "gulp-filter";
import inject from "gulp-inject";
import livereload from "gulp-livereload";
import uglify from "gulp-uglify";
import cleanCSS from "gulp-clean-css";
import sass from "gulp-sass";
import autoprefixer from "gulp-autoprefixer";
import rename from "gulp-rename";
import rev from "gulp-rev";
import watch from "gulp-watch";
import gulpif from "gulp-if";
import browserify from "browserify";
import babelify from "babelify";
import rememberify from "rememberify";
import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
import del from "del";
import runSequence from "run-sequence";
import getWantedDependencies from "get-wanted-dependencies";
import express from "express";
import http from "http";
import config from "./gulpconfig";

let server = http.createServer(express().use(express.static(config.buildDir)));
let env = config.environments.find(e => e.name === (process.env.NODE_ENV || "development"));
if (env) {
  gutil.log(gutil.colors.gray(`Selected environment = ${env.name}.`));
} else {
  throw new Error("Unsupported environment specified.");
}

let bundler = browserify({
  entries: `./${config.script}`,
  cache: {}
}).transform(babelify).plugin(rememberify);

gulp.task("clean", done => {
  del(config.buildDir).then(() => done()).catch(err => done(err));
});

gulp.task("check-dependencies", done => {
  getWantedDependencies(__dirname).then(wantedDependencies => {
    if (wantedDependencies.length > 0) {
      gutil.log(gutil.colors.red("Wanted dependencies not installed. Run `npm install`."));
      gutil.beep();
      process.exit(1);
    }

    done();
  }).catch(err => done(err));
});

gulp.task("build-scripts", () => {
  return bundler
    .bundle()
    .on("error", function(err) {
      gutil.log(gutil.colors.red(err.message));
      gutil.beep();
      this.emit("end");
    })
    .pipe(source(`${env.name}.js`)) // Convert from Browserify stream to vinyl stream.
    .pipe(buffer()) // Convert from streaming mode to buffered mode.
    .pipe(gulpif(env.minify, uglify({ mangle: false })))
    .pipe(rev())
    .pipe(gulp.dest(`${config.buildDir}/scripts`));
});

gulp.task("build-styles", () => {
  return gulp
    .src(config.style)
    .pipe(sass().on("error", function(err) {
      gutil.log(gutil.colors.red(err.messageFormatted));
      gutil.beep();
      this.emit("end");
    }))
    .pipe(rename(`${env.name}.css`))
    .pipe(autoprefixer({ browsers: ["> 1%"] }))
    .pipe(gulpif(env.minify, cleanCSS()))
    .pipe(rev())
    .pipe(gulp.dest(`${config.buildDir}/styles`));
});

gulp.task("build-misc", () => {
  let imagesFilter = filter("**/*.{ico,gif,jpg,png}", { restore: true });
  let soundsFilter = filter("**/*.{mp3,ogg}", { restore: true });
  let fontsFilter = filter("**/*.json", { restore: true });
  let modelsFilter = filter("**/*.obj", { restore: true });

  return gulp
    .src(config.misc)
    .pipe(imagesFilter)
    .pipe(gulp.dest(`${config.buildDir}/images`))
    .pipe(imagesFilter.restore)
    .pipe(soundsFilter)
    .pipe(gulp.dest(`${config.buildDir}/sounds`))
    .pipe(soundsFilter.restore)
    .pipe(fontsFilter)
    .pipe(gulp.dest(`${config.buildDir}/fonts`))
    .pipe(fontsFilter.restore)
    .pipe(modelsFilter)
    .pipe(gulp.dest(`${config.buildDir}/models`))
    .pipe(modelsFilter.restore);
});

gulp.task("build-index", () => {
  return gulp
    .src(config.index)
    .pipe(inject(
      gulp.src(`${config.buildDir}/**/*.{js,css}`, { read: false }),
      { ignorePath: config.buildDir, addRootSlash: false, removeTags: true, quiet: true }
    ))
    .pipe(gulp.dest(config.buildDir));
});

gulp.task("build", ["clean"], done => {
  runSequence(["check-dependencies", "build-scripts", "build-styles", "build-misc"], "build-index", done);
});

gulp.task("serve", ["build"], done => {
  server.listen(config.serverPort, () => {
    gutil.log(gutil.colors.green(`Web server started and listening on port ${server.address().port}.`));
    done();
  });
});

gulp.task("reload", () => {
  return gulp.src(config.buildDir).pipe(livereload({ start: true, quiet: true }));
});

gulp.task("watch", ["serve", "reload"], () => {
  return watch(`${config.sourceDir}/**/*`, file => {
    // If a JS file was changed, purge it from the Browserify cache.
    if (file.extname === ".js") {
      rememberify.forget(bundler, file.path);
    }

    runSequence("build", "reload");
  });
});

gulp.task("default", ["build"]);
