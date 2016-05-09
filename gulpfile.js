'use strict';

var gulp = require('gulp');
var change = require('gulp-change');
var babel = require('gulp-babel');
var gulpif = require('gulp-if');
var gulpFilter = require('gulp-filter');
var shell = require('gulp-shell');
var wait = require('gulp-wait');
var clean = require('gulp-clean');
var zip = require('gulp-zip');
var rename = require('gulp-rename');
var util = require('gulp-util');
var runSequence = require('run-sequence');

/* clean */
gulp.task('clean', function () {
  return gulp.src([
    'builds/unpacked/chrome/*',
    'builds/unpacked/opera/*',
    'builds/unpacked/firefox/*',
    'builds/unpacked/electron/*',
    'builds/unpacked/android/*'
  ], {read: false})
    .pipe(clean());
});

/* electron build */
gulp.task('electron-build', function () {
  return gulp.src([
    'src/**/*'
  ])
  .pipe(gulpFilter(function (f) {
    if (f.relative.indexOf('.DS_Store') !== -1 || f.relative.indexOf('Thumbs.db') !== -1) {
      return false;
    }
    if (f.relative.indexOf('firefox') !== -1 || f.relative.indexOf('android') !== -1 || f.relative.indexOf('chrome') !== -1 || f.relative.indexOf('opera') !== -1) {
      return false;
    }
    if (f.relative.split('/').length === 1) {
      return f.relative === 'package-electron.json';
    }
    return true;
  }))
  .pipe(rename(function (path) {
    if (path.basename === 'package-electron') {
      path.basename = 'package';
    }
    return path;
  }))
  .pipe(gulpif(function (f) {
    return f.path.indexOf('.js') !== -1 && f.path.indexOf('.json') === -1;
  }, change(function (content) {
    return content.replace('firefox/firefox', 'electron/electron');
  })))
  .pipe(gulpif(function (f) {
    return f.path.indexOf('.html') !== -1 && f.path.indexOf('info/index.html') === -1;
  }, change(function (content) {
    return content.replace(/.*shadow_index\.js.*/, '    <script src="electron/electron.js"></script>\n    <script src="index.js"></script>');
  })))
  .pipe(gulpif(function (f) {
    return f.path.indexOf('.html') !== -1 && f.path.indexOf('info/index.html') !== -1;
  }, change(function (content) {
    return content.replace(/.*shadow_index\.js.*/, '    <script src="showdown.js"></script>\n    <script src="electron/electron.js"></script>\n    <script src="index.js"></script>');
  })))
  .pipe(gulp.dest('builds/unpacked/electron'))
  .pipe(zip('electron.zip'))
  .pipe(gulp.dest('builds/packed'));
});
gulp.task('electron-install', function () {
  let keys = Object.keys(gulp.env).filter(key => key !== '_');
  let args = keys.map(key => `--${key}="${gulp.env[key]}"`).join(' ');
  return gulp.src('')
  .pipe(wait(1000))
  .pipe(shell([
    '"/Applications/Electron.app/Contents/MacOS/Electron" `pwd` ' + args + ' &'
  ], {
    cwd: './builds/unpacked/electron'
  }));
});
gulp.task('electron-packager', function () {
  return gulp.src('')
  .pipe(wait(1000))
  .pipe(shell([
    'npm install',
    'electron-packager . "Turbo Download Manager" --platform=darwin --arch=x64 --version=0.37.7 --icon ../../packed/mac.icns',
    '7z a -mx9 -r tdm-darwin-x64.7z "Turbo Download Manager-darwin-x64"/*',
    'mv tdm-darwin-x64.7z ..',
    'rm -r "Turbo Download Manager-darwin-x64"/',
    'electron-packager . "Turbo Download Manager" --platform=win32 --arch=x64 --version=0.37.7 --icon ../../packed/windows.ico',
    '7z a -mx9 -r tdm-win32-x64.7z "Turbo Download Manager-win32-x64"/*',
    'mv tdm-win32-x64.7z ..',
    'rm -r "Turbo Download Manager-win32-x64"/',
    'electron-packager . "Turbo Download Manager" --platform=win32 --arch=ia32 --version=0.37.7 --icon ../../packed/windows.ico',
    '7z a -mx9 -r tdm-win32-ia32.7z "Turbo Download Manager-win32-ia32"/*',
    'mv tdm-win32-ia32.7z ..',
    'rm -r "Turbo Download Manager-win32-ia32"/',
    'electron-packager . "Turbo Download Manager" --platform=linux --arch=x64 --version=0.37.7',
    '7z a -mx9 -r tdm-linux-x64.7z "Turbo Download Manager-linux-x64"/*',
    'mv tdm-linux-x64.7z ..',
    'rm -r "Turbo Download Manager-linux-x64"/',
    'electron-packager . "Turbo Download Manager" --platform=linux --arch=ia32 --version=0.37.7',
    '7z a -mx9 -r tdm-linux-ia32.7z "Turbo Download Manager-linux-ia32"/*',
    'mv tdm-linux-ia32.7z ..',
    'rm -r "Turbo Download Manager-linux-ia32"/'
  ], {
    cwd: './builds/unpacked/electron'
  }));
});
/* chrome build */
gulp.task('chrome-build', function () {
  return gulp.src([
    'src/**/*'
  ])
  .pipe(gulpFilter(function (f) {
    if (f.relative.indexOf('.DS_Store') !== -1 || f.relative.indexOf('Thumbs.db') !== -1) {
      return false;
    }
    if (f.relative.indexOf('firefox') !== -1 || f.relative.indexOf('opera') !== -1 || f.relative.indexOf('android') !== -1 || f.relative.indexOf('electron') !== -1) {
      return false;
    }
    if (f.relative.split('/').length === 1) {
      return f.relative === 'manifest-app.json';
    }
    return true;
  }))
  .pipe(rename(function (path) {
    if (path.basename === 'manifest-app') {
      path.basename = 'manifest';
    }
    return path;
  }))
  .pipe(gulpif(function (f) {
    return f.path.indexOf('.html') !== -1 && f.path.indexOf('info/index.html') === -1;
  }, change(function (content) {
    return content.replace(/.*shadow_index\.js.*/, '    <script src="chrome/chrome.js"></script>\n    <script src="index.js"></script>');
  })))
  .pipe(gulpif(function (f) {
    return f.path.indexOf('.html') !== -1 && f.path.indexOf('info/index.html') !== -1;
  }, change(function (content) {
    return content.replace(/.*shadow_index\.js.*/, '    <script src="showdown.js"></script>\n    <script src="chrome/chrome.js"></script>\n    <script src="index.js"></script>');
  })))
  .pipe(gulp.dest('builds/unpacked/chrome'))
  .pipe(zip('chrome.zip'))
  .pipe(gulp.dest('builds/packed'));
});
gulp.task('chrome-install', function () {
  return gulp.src('')
  .pipe(wait(1000))
  .pipe(shell([
    '"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --console --load-and-launch-app=`pwd` &'
  ], {
    cwd: './builds/unpacked/chrome'
  }));
});
/* opera build */
gulp.task('opera-build', function () {
  return gulp.src([
    'src/**/*'
  ])
  .pipe(gulpFilter(function (f) {
    if (f.relative.indexOf('.DS_Store') !== -1 || f.relative.indexOf('Thumbs.db') !== -1) {
      return false;
    }
    if (f.relative.indexOf('firefox') !== -1 || f.relative.indexOf('android') !== -1 || f.relative.indexOf('electron') !== -1) {
      return false;
    }
    if (f.relative.indexOf('chrome') !== -1 && f.relative.indexOf('chrome-cm.js') === -1 && f.relative.indexOf('chrome-br.js') === -1) {
      return false;
    }
    if (f.relative.split('/').length === 1) {
      return f.relative === 'manifest-extension.json';
    }
    return true;
  }))
  .pipe(rename(function (path) {
    if (path.basename === 'manifest-extension') {
      path.basename = 'manifest';
    }
    return path;
  }))
  .pipe(gulpif(function (f) {
    return f.path.indexOf('.html') !== -1 && f.path.indexOf('info/index.html') === -1;
  }, change(function (content) {
    return content.replace(/.*shadow_index\.js.*/, '    <script src="opera/opera.js"></script>\n    <script src="index.js"></script>');
  })))
  .pipe(gulpif(function (f) {
    return f.path.indexOf('.html') !== -1 && f.path.indexOf('info/index.html') !== -1;
  }, change(function (content) {
    return content.replace(/.*shadow_index\.js.*/, '    <script src="showdown.js"></script>\n    <script src="opera/opera.js"></script>\n    <script src="index.js"></script>');
  })))
  .pipe(gulp.dest('builds/unpacked/opera'))
  .pipe(zip('opera.zip'))
  .pipe(gulp.dest('builds/packed'));
});
gulp.task('opera-install', function () {
  gulp.src('')
  .pipe(wait(1000))
  .pipe(shell([
    '"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --console --load-and-launch-app=`pwd` &'
  ], {
    cwd: './builds/unpacked/opera'
  }));
});
/* android build */
gulp.task('android-build', function () {
  return gulp.src([
    'src/**/*'
  ])
  .pipe(gulpFilter(function (f) {
    if (f.relative.indexOf('.DS_Store') !== -1 || f.relative.indexOf('Thumbs.db') !== -1) {
      return false;
    }
    if (f.relative.indexOf('firefox') !== -1 || f.relative.indexOf('opera') !== -1 || f.relative.indexOf('electron') !== -1) {
      return false;
    }
    if (f.relative.indexOf('chrome') !== -1 && f.relative.indexOf('chrome-cm.js') === -1) {
      return false;
    }
    if (f.relative.split('/').length === 1) {
      return f.relative === 'manifest-android.json' ? true : false;
    }
    return true;
  }))
  .pipe(rename(function (path) {
    if (path.basename === 'manifest-android') {
      path.basename = 'manifest';
    }
    return path;
  }))
  .pipe(gulpif(function (f) {
    return f.path.indexOf('.html') !== -1 && f.path.indexOf('info/index.html') === -1;
  }, change(function (content) {
    return content.replace(/.*shadow_index\.js.*/, '    <script src="android/android.js"></script>\n    <script src="index.js"></script>');
  })))
  .pipe(gulpif(function (f) {
    return f.path.indexOf('.html') !== -1 && f.path.indexOf('info/index.html') !== -1;
  }, change(function (content) {
    return content.replace(/.*shadow_index\.js.*/, '    <script src="showdown.js"></script>\n    <script src="android/android.js"></script>\n    <script src="index.js"></script>');
  })))
  .pipe(gulpif(function (f) {
    return f.path.indexOf('.js') !== -1 && f.path.indexOf('.json') === -1 && f.relative.indexOf('EventEmitter.js') === -1;
  }, babel({
    presets: ['es2015']
  })))
  .pipe(gulp.dest('builds/unpacked/android'))
  .pipe(zip('android.zip'))
  .pipe(gulp.dest('builds/packed'));
});
gulp.task('android-install', function () {
  return gulp.src('')
  .pipe(wait(1000))
  .pipe(shell([
    'pwd & cca run android --device'
  ], {
    cwd: 'trash/android/TDM/'
  }));
});

/* firefox build */
gulp.task('firefox-build', function () {
  return gulp.src([
    'src/**/*'
  ])
  .pipe(gulpFilter(function (f) {
    if (f.relative.indexOf('.DS_Store') !== -1 || f.relative.indexOf('Thumbs.db') !== -1) {
      return false;
    }
    if (f.relative.indexOf('chrome') !== -1 &&
      f.relative !== 'chrome.manifest' &&
      f.relative.indexOf('firefox/chrome') === -1
    ) {
      return false;
    }
    if (f.relative.indexOf('opera') !== -1 || f.relative.indexOf('android') !== -1 || f.relative.indexOf('electron') !== -1) {
      return false;
    }
    if (f.relative.split('/').length === 1) {
      return ['package-firefox.json', 'chrome.manifest'].indexOf(f.relative) !== -1;
    }
    return true;
  }))
  .pipe(rename(function (path) {
    if (path.basename === 'package-firefox') {
      path.basename = 'package';
    }
    return path;
  }))
  .pipe(gulpif(function (f) {
    return f.path.indexOf('.html') !== -1;
  }, change(function (content) {
    return content.replace(/\n.*shadow_index\.js.*/, '');
  })))
  .pipe(gulp.dest('builds/unpacked/firefox'));
});
/* firefox pack */
gulp.task('firefox-pack', function () {
  return gulp.src('')
  .pipe(wait(1000))
  .pipe(shell([
    'jpm xpi',
    'mv *.xpi ../../packed/firefox.xpi',
  ], {
    cwd: './builds/unpacked/firefox'
  }))
  .pipe(shell([
    'zip firefox.xpi icon.png icon64.png',
  ], {
    cwd: './builds/packed'
  }));
});
/* firefox install */
gulp.task('firefox-install', function () {
  return gulp.src('')
  .pipe(shell([
    'jpm post --post-url http://localhost:8888/'
  ], {
    cwd: './builds/unpacked/firefox'
  }))
});
/* */
gulp.task('webapp', (callback) => runSequence('clean', 'webapp-build', callback));
gulp.task('android', (callback) => runSequence('clean', 'android-build', 'android-install', callback));
gulp.task('chrome', (callback) => runSequence('clean', 'chrome-build', 'chrome-install', callback));
gulp.task('chrome-travis', (callback) => runSequence('clean', 'chrome-build', callback));
gulp.task('opera', (callback) => runSequence('clean', 'opera-build', callback));
gulp.task('opera-travis', (callback) => runSequence('clean', 'opera-build', callback));
gulp.task('firefox', (callback) => runSequence('clean', 'firefox-build', 'firefox-pack', 'firefox-install', callback));
gulp.task('firefox-travis', (callback) => runSequence('clean', 'firefox-build', 'firefox-pack', callback));
gulp.task('electron', (callback) => runSequence('clean', 'electron-build', 'electron-install', callback));
gulp.task('electron-travis', (callback) => runSequence('clean', 'electron-build', 'electron-packager', callback));
