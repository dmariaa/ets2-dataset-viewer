const { src, dest, } = require('gulp');
const _if = require('gulp-if');
const rename = require('gulp-rename');
const filter = require('gulp-filter');
const del = require('del');

function build(cb) {
  src([
    './**/bin/**',
    './**/src/**',
    '!node_modules',
    '!node_modules/**',
    '../client/**/build/**',
    '!../client/node_modules',
    '!../client/node_modules/**',
    './package.json',
    './ets2-dataset-viewer.json'
  ])
    .pipe(_if('build/**', rename((path) => {
      // console.log(path.dirname + ' => ' + path.dirname.replace('build', 'public'));
      return {
        dirname: path.dirname.replace('build', 'public'),
        basename: path.basename,
        extname: path.extname
      }
    })))
    .pipe(filter([ '**', '!build' ]))
    .pipe(dest('dist'));

    del([
      'dist/build'
    ]);

  cb();
}

function clean(cb) {
  del([
    'dist/**'
  ]);

  cb();
}

exports.build = build;
exports.clean = clean;


