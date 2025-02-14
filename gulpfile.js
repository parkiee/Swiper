(function(){
    'use strict';
    var gulp = require('gulp'),
        connect = require('gulp-connect'),
        open = require('gulp-open'),
        less = require('gulp-less'),
        rename = require('gulp-rename'),
        header = require('gulp-header'),
        path = require('path'),
        uglify = require('gulp-uglify'),
        sourcemaps = require('gulp-sourcemaps'),
        cleanCSS = require('gulp-clean-css'),
        tap = require('gulp-tap'),
        concat = require('gulp-concat'),
        jshint = require('gulp-jshint'),
        stylish = require('jshint-stylish'),
        fs = require('fs'),
        paths = {
            root: './',
            build: {
                root: 'build/',
                styles: 'build/css/',
                scripts: 'build/js/'
            },
            custom: {
                root: 'custom/',
                styles: 'custom/css/',
                scripts: 'custom/js/'
            },
            dist: {
                root: 'dist/',
                styles: 'dist/css/',
                scripts: 'dist/js/'
            },
            playground: {
                root: 'playground/'
            },
            source: {
                root: 'src/',
                styles: 'src/less/',
                scripts: 'src/js/*.js'
            },
        },
        swiper = {
            filename: 'swiper',
            jsFiles: [
                'src/js/wrap-start.js',
                'src/js/swiper-intro.js',
                'src/js/core.js',
                // 'src/js/effects.js',
                // 'src/js/lazy-load.js',
                // 'src/js/scrollbar.js',
                'src/js/controller.js',
                // 'src/js/hashnav.js',
                // 'src/js/history.js',
                // 'src/js/keyboard.js',
                // 'src/js/mousewheel.js',
                // 'src/js/parallax.js',
                // 'src/js/zoom.js',
                // 'src/js/plugins.js',
                'src/js/emitter.js',
                // 'src/js/a11y.js',
                'src/js/init.js',
                'src/js/swiper-outro.js',
                'src/js/swiper-proto.js',
                'src/js/dom.js',
                // 'src/js/get-dom-lib.js',
                // 'src/js/dom-plugins.js',
                'src/js/wrap-end.js',
                'src/js/amd.js'
            ],
            pkg: require('./bower.json'),
            modules: require('./modules.json'),
            banner: [
                '/**',
                ' * Swiper <%= pkg.version %>',
                ' * <%= pkg.description %>',
                ' * ',
                ' * <%= pkg.homepage %>',
                ' * ',
                ' * Copyright <%= date.year %>, <%= pkg.author %>',
                ' * The iDangero.us',
                ' * http://www.idangero.us/',
                ' * ',
                ' * Licensed under <%= pkg.license.join(" & ") %>',
                ' * ',
                ' * Released on: <%= date.month %> <%= date.day %>, <%= date.year %>',
                ' */',
                ''].join('\n'),
            customBanner: [
                '/**',
                ' * Swiper <%= pkg.version %> - Custom Build',
                ' * <%= pkg.description %>',
                ' * ',
                ' * Included modules: <%= modulesList %>',
                ' * ',
                ' * <%= pkg.homepage %>',
                ' * ',
                ' * Copyright <%= date.year %>, <%= pkg.author %>',
                ' * The iDangero.us',
                ' * http://www.idangero.us/',
                ' * ',
                ' * Licensed under <%= pkg.license.join(" & ") %>',
                ' * ',
                ' * Released on: <%= date.month %> <%= date.day %>, <%= date.year %>',
                ' */',
                ''].join('\n'),
            date: {
                year: new Date().getFullYear(),
                month: ('January February March April May June July August September October November December').split(' ')[new Date().getMonth()],
                day: new Date().getDate()
            }
        };

    function addJSIndent (file, t, minusIndent) {
        var addIndent = '        ';
        var filename = file.path.split('src/js/')[1];
        if (['wrap-start.js', 'wrap-start-umd.js', 'wrap-end.js', 'wrap-end-umd.js', 'amd.js'].indexOf(filename) !== -1) {
            addIndent = '';
        }
        if (filename === 'swiper-intro.js' || filename === 'swiper-intro-f7.js' || filename === 'swiper-outro.js' || filename === 'dom.js' || filename === 'get-dom-lib.js' || filename === 'get-jquery.js' || filename === 'dom-plugins.js' || filename === 'swiper-proto.js') addIndent = '    ';
        if (minusIndent) {
            addIndent = addIndent.substring(4);
        }
        if (addIndent !== '') {
            var fileLines = fs.readFileSync(file.path).toString().split('\n');
            var newFileContents = '';
            for (var i = 0; i < fileLines.length; i++) {
                newFileContents += addIndent + fileLines[i] + (i === fileLines.length ? '' : '\n');
            }
            file.contents = new Buffer(newFileContents);
        }
    }
    gulp.task('scripts', function (cb) {
        gulp.src(swiper.jsFiles)
            .pipe(tap(function (file, t){
                addJSIndent (file, t);
            }))
            .pipe(sourcemaps.init())
            .pipe(concat(swiper.filename + '.js'))
            .pipe(header(swiper.banner, { pkg : swiper.pkg, date: swiper.date } ))
            .pipe(jshint())
            .pipe(jshint.reporter(stylish))
            .pipe(sourcemaps.write('./maps/'))
            .pipe(gulp.dest(paths.build.scripts));
        cb();
    });
    gulp.task('styles', function (cb) {

        gulp.src(paths.source.styles + 'swiper.less')
            .pipe(less({
                paths: [ path.join(__dirname, 'less', 'includes') ]
            }))
            .pipe(header(swiper.banner, { pkg : swiper.pkg, date: swiper.date }))
            .pipe(rename(function(path) {
                path.basename = swiper.filename;
            }))
            .pipe(gulp.dest(paths.build.styles))
            .pipe(connect.reload());

        gulp.src([
                paths.source.styles + 'core.less',
                paths.source.styles + 'navigation-f7.less',
                paths.source.styles + 'effects.less',
                paths.source.styles + 'zoom.less',
                paths.source.styles + 'scrollbar.less',
                paths.source.styles + 'preloader-f7.less'
            ])
            .pipe(concat(swiper.filename + '.framework7.less'))
            .pipe(header('/* === Swiper === */\n'))
            .pipe(gulp.dest(paths.build.styles));
        cb();
    });
    gulp.task('build', ['scripts', 'styles'], function (cb) {
        cb();
    });

    gulp.task('dist', function () {
        gulp.src([paths.build.scripts + swiper.filename + '.js'])
            .pipe(gulp.dest(paths.dist.scripts))
            .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(header(swiper.banner, { pkg : swiper.pkg, date: swiper.date }))
            .pipe(rename(function(path) {
                path.basename = swiper.filename + '.min';
            }))
            .pipe(sourcemaps.write('./maps'))
            .pipe(gulp.dest(paths.dist.scripts));

        gulp.src([paths.build.scripts + swiper.filename + '.jquery.js'])
            .pipe(gulp.dest(paths.dist.scripts))
            .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(header(swiper.banner, { pkg : swiper.pkg, date: swiper.date } ))
            .pipe(rename(function(path) {
                path.basename = swiper.filename + '.jquery.min';
            }))
            .pipe(sourcemaps.write('./maps'))
            .pipe(gulp.dest(paths.dist.scripts));

        gulp.src([paths.build.scripts + swiper.filename + '.jquery.umd.js'])
            .pipe(gulp.dest(paths.dist.scripts))
            .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(header(swiper.banner, { pkg : swiper.pkg, date: swiper.date } ))
            .pipe(rename(function(path) {
                path.basename = swiper.filename + '.jquery.umd.min';
            }))
            .pipe(sourcemaps.write('./maps'))
            .pipe(gulp.dest(paths.dist.scripts));

        gulp.src(paths.build.styles + '*.css')
            .pipe(gulp.dest(paths.dist.styles))
            .pipe(cleanCSS({
                advanced: false,
                aggressiveMerging: false,
            }))
            .pipe(header(swiper.banner, { pkg : swiper.pkg, date: swiper.date }))
            .pipe(rename(function(path) {
                path.basename = swiper.filename + '.min';
            }))
            .pipe(gulp.dest(paths.dist.styles));
    });

    /* =================================
    Custom Build
    ================================= */
    gulp.task('custom', function () {
        var modules = process.argv.slice(3);
        modules = modules.toString();
        if (modules === '') {
            modules = [];
        }
        else {
            modules = modules.substring(1).replace(/ /g, '').replace(/,,/g, ',');
            modules = modules.split(',');
        }
        var modulesJs = [], modulesLess = [];
        var i, module;
        modulesJs.push.apply(modulesJs, swiper.modules.core_intro.js);
        modulesLess.push.apply(modulesLess, swiper.modules.core_intro.less);

        for (i = 0; i < modules.length; i++) {
            module = swiper.modules[modules[i]];
            if (!(module)) continue;

            if (module.dependencies && module.dependencies.length > 0) {
                modules.push.apply(modules, module.dependencies);
            }
            if (module.js.length > 0) {
                modulesJs.push.apply(modulesJs, module.js);
            }
            if (module.less && module.less.length > 0) {
                modulesLess.push.apply(modulesLess, module.less);
            }
        }
        modulesJs.push.apply(modulesJs, swiper.modules.core_outro.js);
        modulesLess.push.apply(modulesLess, swiper.modules.core_outro.less);

        // Unique
        var customJsList = [];
        var customLessList = [];
        for (i = 0; i < modulesJs.length; i++) {
            if (customJsList.indexOf(modulesJs[i]) < 0) customJsList.push(modulesJs[i]);
        }
        for (i = 0; i < modulesLess.length; i++) {
            if (customLessList.indexOf(modulesLess[i]) < 0) customLessList.push(modulesLess[i]);
        }

        // JS
        gulp.src(customJsList)
            .pipe(tap(function (file, t){
                addJSIndent (file, t);
            }))
            .pipe(concat(swiper.filename + '.custom.js'))
            .pipe(header(swiper.customBanner, { pkg : swiper.pkg, date: swiper.date, modulesList: modules.join(',') } ))
            .pipe(jshint())
            .pipe(jshint.reporter(stylish))
            .pipe(gulp.dest(paths.custom.scripts))

            .pipe(uglify())
            .pipe(header(swiper.customBanner, { pkg : swiper.pkg, date: swiper.date, modulesList: modules.join(',') }))
            .pipe(rename(function(path) {
                path.basename = path.basename + '.min';
            }))
            .pipe(gulp.dest(paths.custom.scripts));

        // CSSes
        gulp.src(customLessList)
            .pipe(concat(swiper.filename + '.custom.less'))
            .pipe(less({
                paths: [ path.join(__dirname, 'less', 'includes') ]
            }))
            .pipe(header(swiper.customBanner, { pkg : swiper.pkg, date: swiper.date, modulesList: modules.join(',') } ))
            .pipe(gulp.dest(paths.custom.styles))

            .pipe(cleanCSS({
                advanced: false,
                aggressiveMerging: false
            }))
            .pipe(header(swiper.customBanner, { pkg : swiper.pkg, date: swiper.date, modulesList: modules.join(',') }))
            .pipe(rename(function(path) {
                path.basename = path.basename + '.min';
            }))
            .pipe(gulp.dest(paths.custom.styles));
    });

    gulp.task('watch', function () {
        gulp.watch(paths.source.scripts, [ 'scripts' ]);
        gulp.watch(paths.source.styles + '*.less', [ 'styles' ]);
    });

    gulp.task('connect', function () {
        return connect.server({
            root: [ paths.root ],
            livereload: true,
            port:'3000'
        });
    });

    gulp.task('open', function () {
        return gulp.src(paths.playground.root + 'index.html').pipe(open({ uri: 'http://localhost:3000/' + paths.playground.root + 'index.html'}));
    });

    gulp.task('server', [ 'watch', 'connect', 'open' ]);

    gulp.task('default', [ 'server' ]);
})();