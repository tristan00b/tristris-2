import browserify from 'browserify'
import browserSync from 'browser-sync'
import del from 'del'
import fiber from 'fibers'
import gulp from 'gulp'
import log from 'gulplog'
import autoprefix from 'gulp-autoprefixer'
import ejs from 'gulp-ejs'
import git from 'gulp-git'
import gulpif from 'gulp-if'
import rename from 'gulp-rename'
import sass from 'gulp-dart-sass'
import sourcemaps from 'gulp-sourcemaps'
import uglify from 'gulp-uglify'
import buffer from 'vinyl-buffer'
import source_stream from 'vinyl-source-stream'

const { series:ser, parallel:par, src, dest:dst, } = gulp
const bsync = browserSync.create()


/* ------------------------------------------------------------------------------------------------------------------ *\
  Config Options
\* ------------------------------------------------------------------------------------------------------------------ */

const is_debugging_enabled = process.env.NODE_ENV === 'debug'

const opts = {
  babelify: {
    sourceMaps: is_debugging_enabled
  },
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
    sourcemaps: is_debugging_enabled,
    loadMaps: is_debugging_enabled
  },
  uglify: {
    keep_fnames: is_debugging_enabled,
    output: {
      beautify: is_debugging_enabled,
    }
  }
}


/* ------------------------------------------------------------------------------------------------------------------ *\
  Task Definitions
\* ------------------------------------------------------------------------------------------------------------------ */

const assets = _ => src('app/assets/**/*.*').pipe(dst('build/assets'))

const markup = _ => {
  return src('app/**/*.@(ejs|html)')
    .pipe(ejs())
    .pipe(rename({ extname: '.html' }))
    .pipe(dst('build'))
}

const scripts = _ => {
  return browserify({
    entries: 'app/scripts/main.js',
    debug: is_debugging_enabled,
  })
  .transform("babelify", opts.babelify)
  .bundle()
  .pipe(source_stream('main.js'))
  .pipe(buffer())
  .pipe(gulpif(is_debugging_enabled, sourcemaps.init(opts.sourcemaps)))
  .pipe(uglify(opts.uglify))
  .pipe(gulpif(is_debugging_enabled, sourcemaps.write('.')))
  .pipe(dst('build/scripts'))
  .on('error', log.error)
}

const styles = _ => {
  return src('app/sass/**/*.scss', opts.sourcemaps)
    .pipe(sass(opts.sass).on('error', sass.logError))
    .pipe(autoprefix())
    .pipe(dst('build/css', opts.sourcemaps))
    .pipe(bsync.stream())
}

const setenv = _ => {
  return git.revParse({args: '--short HEAD'}, (err, hash) => {
    if (err) throw err
    process.env.REVISION = `${hash}`
  })
}

gulp.task('watch:assets', _ => {
  gulp.watch('app/assets/**.*', assets)
  gulp.watch('build/scripts/**/*').on('change', bsync.reload)
})


gulp.task('watch:markup', _ => {
  gulp.watch('app/**/*.@(ejs|html)', markup)
  gulp.watch('build/scripts/**/*.html').on('change', bsync.reload)
})

gulp.task('watch:scripts', _ => {
  gulp.watch('app/scripts/**/*.js', scripts)
  gulp.watch('build/scripts/**/*.js').on('change', bsync.reload)
})

gulp.task('watch:styles', _ => {
  gulp.watch('app/scss/**/*.scss', styles)
})

const clean = _ => del('build/*')
const build = ser(clean, setenv, par(assets, markup, styles, scripts))
const watch = par('watch:assets', 'watch:markup', 'watch:scripts', 'watch:styles')
const serve = ser(build, par(watch, _ => bsync.init(opts.bsync)))


/* ------------------------------------------------------------------------------------------------------------------ *\
  Exports
\* ------------------------------------------------------------------------------------------------------------------ */

export {
  clean,
  build,
  serve,
  serve as default
}
