// Karma configuration
module.exports = function (config) {

	var libSources = []; //require(__dirname+'/../build/build.js').getFiles();

	var files = [
		//'public/vendors/traceur/traceur.min.js',
		'public/vendors/es6-shim/es6-shim.min.js',
		'public/vendors/es6-module-loader/dist/es6-module-loader.js',
		'public/vendors/fetch/fetch.js',
		//'lib/es6-starter.min.js', //compiled version of all of the above
		//"spec/sinon.js",
		//{pattern: "spec/expect.js", served: true, included: false, watched: true}
	].concat(libSources, [
		//"spec/after.js",
		"node_modules/happen/happen.js",
    "spec/suites/system.test-config.js",
		"spec/suites/SpecHelper.js",
		// source
		{pattern: "src/core/*.js", served: true, included: false, watched: true},
		{pattern: "src/dom/*.js", served: true, included: false, watched: true},
		{pattern: "src/geometry/*.js", served: true, included: false, watched: true},
		{pattern: "src/geo/*.js", served: true, included: false, watched: true},
		{pattern: "src/geo/crs/*.js", served: true, included: false, watched: true},
		{pattern: "src/geo/projection/*.js", served: true, included: false, watched: true},
		{pattern: "src/map/Map.js", served: true, included: false, watched: true},
		{pattern: "src/layer/*.js", served: true, included: false, watched: true},
		{pattern: "src/layer/tile/*.js", served: true, included: false, watched: true},
		{pattern: "src/layer/marker/*.js", served: true, included: false, watched: true},
		// specs
		//"spec/suites/core/*Spec.js",
		//"spec/suites/dom/*Spec.js",
		//"spec/suites/geometry/*Spec.js",
		//"spec/suites/geo/*Spec.js",
		//"spec/suites/layer/PopupSpec.js",
		"spec/suites/layer/tile/GridLayerSpec.js",
		//"spec/suites/map/MapSpec.js",
		//"spec/suites/**/*.js",
		{pattern: "dist/images/*.png", included: false}
	]);

	config.set({
		// base path, that will be used to resolve files and exclude
		basePath: '../',

		plugins: [
			'karma-mocha',
			'karma-expect',
			'karma-sinon',
			'karma-systemjs',
//			'karma-coverage',
//			'karma-phantomjs-launcher',
//			'karma-chrome-launcher',
//			'karma-safari-launcher',
//			'karma-firefox-launcher',
			'karma-chrome-launcher'],

		systemjs: {
			// Path to your SystemJS configuration file 
			configFile: 'system.conf.js',
		 
			// Patterns for files that you want Karma to make available, but not loaded until a module requests them. eg. Third-party libraries. 
			serveFiles: [
				//'spec/expect.js',
				//'spec/sinon.js'
				//'lib/**/*.js'
			],
		 
			// SystemJS configuration specifically for tests, added after your config file. 
			// Good for adding test libraries and mock modules 
			config: {
				paths: {
				//	'angular-mocks': 'bower_components/angular-mocks/angular-mocks.js'
				}
			}
		},

		// frameworks to use
		frameworks: ['systemjs', 'expect', 'sinon', 'mocha'],

    client: {
      mocha: {
        timeout: 2000
      }
    },

		// list of files / patterns to load in the browser
		files: files,
		exclude: [],

		// test results reporter to use
		// possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
		reporters: ['dots'],
    //reporters: ['spec'/*, 'coverage'*/],

		// web server port
		port: 9876,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,

		customLaunchers: {
			'Custom_Chrome': {
				base: 'Chrome',
				flags: ['--enable-javascript-harmony', '--enable-web-midi']
			}
		},

		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		//browsers: ['PhantomJS'],
		browsers: ['Custom_Chrome'],

		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 10000,

		// Workaround for PhantomJS random DISCONNECTED error
		browserDisconnectTimeout: 10000, // default 2000
		browserDisconnectTolerance: 1, // default 0

		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: true
	});
};
