// Karma configuration
module.exports = function (config) {

	var libSources = []; //require(__dirname+'/../build/build.js').getFiles();

	var files = [
		'public/vendors/traceur/traceur.min.js',
		'public/vendors/es6-shim/es6-shim.min.js',
		'public/vendors/es6-module-loader/dist/es6-module-loader.js',
		'public/vendors/fetch/fetch.js',
		//'lib/es6-starter.min.js', //compiled version of all of the above
		"spec/sinon.js",
		"spec/expect.js"
	].concat(libSources, [
		//"spec/after.js",
		"node_modules/happen/happen.js",
    "spec/suites/system.test-config.js",
		"spec/suites/SpecHelper.js",
		// source
		{pattern: "src/core/Util.js", served: true, included: false, watched: true},
		{pattern: "src/geometry/*.js", served: true, included: false, watched: true},
		{pattern: "src/geo/*.js", served: true, included: false, watched: true},
		{pattern: "src/geo/crs/*.js", served: true, included: false, watched: true},
		{pattern: "src/geo/projection/*.js", served: true, included: false, watched: true},
		// specs
		"spec/suites/geometry/*Spec.js",
		"spec/suites/geo/*Spec.js",
		//"spec/suites/geo/LatLngSpec.js",
		//"spec/suites/geo/LatLngBoundsSpec.js",
		//"spec/suites/geo/ProjectionSpec.js",
		//"spec/suites/geo/CRSSpec.js",
		//"spec/suites/geometry/BoundsSpec.js",
		//"spec/suites/geometry/LineUtilSpec.js",
		//"spec/suites/geometry/PolyUtilSpec.js",
		//"spec/suites/geometry/TransformationSpec.js",
		//"spec/suites/**/*.js",
		{pattern: "dist/images/*.png", included: false}
	]);

	config.set({
		// base path, that will be used to resolve files and exclude
		basePath: '../',

		plugins: [
			'karma-mocha',
			'karma-coverage',
			'karma-phantomjs-launcher',
			'karma-chrome-launcher',
			'karma-safari-launcher',
			'karma-firefox-launcher'],

		// frameworks to use
		frameworks: ['mocha'],

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
		captureTimeout: 100000,

		// Workaround for PhantomJS random DISCONNECTED error
		browserDisconnectTimeout: 10000, // default 2000
		browserDisconnectTolerance: 1, // default 0

		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: true
	});
};
