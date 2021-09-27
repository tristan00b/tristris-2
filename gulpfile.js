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
import jsdoc from 'gulp-jsdoc3'
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
  jsdoc: {
    opts: {
      destination: 'build/doc',
      template: 'node_modules/docdash',
    },
    recurseDepth: 10,
    plugins: [
      'plugins/markdown'
    ],
    sourceType: 'module',
    templates: {
      cleverLinks: true,
      monospaceLinks: true
    },
    docdash: {
      static: true,
      sort: true,
      search: true,
      collapse: true,
      typedefs: true,
      removeQuotes: "none",
      scripts: [],
      menu:{
        "Github repo": {
          href:"https://github.com/tristan00b/tristris-2",
          target:"_blank",
          class:"menu-item",
          id:"repository"
        }
      }
    },
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

const assets = async _ => {
  src('app/game/textures/**.*').pipe(dst('build/assets/textures'))
  src('app/images/**/*.*').pipe(dst('build/assets/images'))
}

const markup = async _ => {
  return src('app/**/*.@(ejs|html)')
    .pipe(ejs())
    .pipe(rename({ extname: '.html' }))
    .pipe(dst('build'))
}

const scripts = /* must be synchronouse for proper browser reloading */ _ => {
  return browserify({
    entries: 'app/main.js',
    debug: is_debugging_enabled,
  })
  .transform('babelify', opts.babelify)
  .bundle()
  .pipe(source_stream('main.js'))
  .pipe(buffer())
  .pipe(gulpif(is_debugging_enabled, sourcemaps.init(opts.sourcemaps)))
  .pipe(uglify(opts.uglify))
  .pipe(gulpif(is_debugging_enabled, sourcemaps.write('.')))
  .pipe(dst('build'))
  .on('error', log.error)
}

const styles = async _ => {
  return src('app/scss/**/*.scss', opts.sourcemaps)
    .pipe(sass(opts.sass).on('error', sass.logError))
    .pipe(autoprefix())
    .pipe(dst('build/css', opts.sourcemaps))
    .pipe(bsync.stream())
}

const setenv = async _ => {
  return git.revParse({args: '--short HEAD'}, (err, hash) => {
    if (err) throw err
    process.env.REVISION = `${hash}`
  })
}

const docs = async _ => {
  return src('app/engine/**/*.js')
    .pipe(jsdoc(opts.jsdoc))
}

const reloadBrowser = cb => {
  bsync.reload()
  cb()
}

gulp.task('watch:assets', async _ => {
  gulp.watch([
    'app/game/textures/**/*',
    'app/images/**/*',
  ], assets).on('change', reloadBrowser)
})

gulp.task('watch:markup', async _ => {
  gulp.watch('app/**/*.@(ejs|html)', markup).on('change', reloadBrowser)
})

gulp.task('watch:scripts', async _ => {
  gulp.watch('app/**/*.js', ser(par(scripts, docs), reloadBrowser))
})

gulp.task('watch:styles', async _ => {
  gulp.watch('app/scss/**/*.scss', styles)
})

gulp.task('server:start', async _ => {
  bsync.init(opts.bsync)
})

const clean = _ => del('build/*')
const build = ser(clean, setenv, par(assets, docs, markup, styles, scripts))
const watch = par('watch:assets', 'watch:markup', 'watch:scripts', 'watch:styles')
const serve = ser(build, par(watch, 'server:start'))


/* ------------------------------------------------------------------------------------------------------------------ *\
  Exports
\* ------------------------------------------------------------------------------------------------------------------ */

export {
  clean,
  build,
  serve,
  docs,
  serve as default
}
