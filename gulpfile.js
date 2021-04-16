
const babelify = require("babelify")
const browserify = require('browserify')
const sync = require('browser-sync').create()
const del = require('del')
const fiber = require('fibers')
const gulp = require('gulp')
const log = require('gulplog')
const autoprefix = require('gulp-autoprefixer')
const ejs = require('gulp-ejs')
const git = require('gulp-git')
const rename = require('gulp-rename')
const sass = require('gulp-dart-sass')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')
const pipeline = require('readable-stream').Stream.pipeline
const buffer = require('vinyl-buffer')
const source_stream = require('vinyl-source-stream');

const { series:ser, parallel:par, src, dest:dst, } = gulp

const is_debugging_enabled = process.env.NODE_ENV === 'debug'

const opts = {
  browserify: {
    debug: is_debugging_enabled
  },
  bsync: {
    listen: 'localhost',
    open: false,
    port: 4040,
    ui: false,
    server: {
      baseDir: 'build',
      index: 'index.html'
    }
  },
  sass: {
    fiber: fiber,
    outputStyle: 'compressed',
  },
  sourcemaps: {
    sourcemaps: is_debugging_enabled
  },
  source_stream: {
    loadMaps: is_debugging_enabled
  }

} // opts

const setenv = _ => {
  return git.revParse({args: '--short HEAD'}, (err, hash) => {
    if (err) throw err
    process.env.REVISION = `${hash}`
  })
}

const clean = _ => {
  return del('build/*')
}

const styles = _ => {
  return src('app/scss/**/*.scss', opts.sourcemaps)
    .pipe(sass(opts.sass).on('error', sass.logError))
    .pipe(autoprefix())
    .pipe(dst('build/css', opts.sourcemaps))
    .pipe(sync.stream())
}

const scripts = _ => {

  const b = browserify({
    entries: 'app/scripts/main.js',
    debug: is_debugging_enabled,
    transform: [babelify]
  })

  return pipeline(
    b.bundle(),
    source_stream('main.js'),
    buffer(),
    sourcemaps.init(opts.sourcemaps),
    uglify(),
    sourcemaps.write('.'),
    dst('build/scripts')
  )
  .on('error', log.error)
}

const markup = _ => {
  return src('app/**/*.@(ejs|html)')
    .pipe(ejs())
    .pipe(rename({ extname: '.html' }))
    .pipe(dst('build'))
}

const assets = _ => {
  return src('app/assets/**/*.*').pipe(dst('build/assets'))
}

const build = par(markup, styles, scripts, assets)

gulp.task('watch:markup', _ => {
  gulp.watch('app/**/*.@(ejs|html)', markup)
      .on('change', sync.reload)
})

gulp.task('watch:scripts', _ => {
  gulp.watch('app/scripts/**/*.js', scripts)
      .on('change', sync.reload)
})

gulp.task('watch:styles', _ => {
  gulp.watch('app/scss/**/*.scss', styles)
})

gulp.task('watch:assets', _ => {
  gulp.watch('app/assets/**.*', assets)
      .on('change', sync.reload)
})

const watch = par('watch:markup', 'watch:scripts', 'watch:styles', 'watch:assets')

const serve = _ => {
  sync.init(opts.bsync)
}

exports.clean   = clean
exports.setenv  = setenv
exports.build   = ser(setenv, build)
exports.serve   = ser(clean, setenv, build, par(watch, serve))
exports.default = exports.serve
