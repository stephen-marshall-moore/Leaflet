"use strict";

var allTestFiles = [];
var TEST_REGEXP = /geo\w*\/\w+(spec|test).js$/i;
//var TEST_REGEXP = /geometry\/Point(spec|test).js$/i;

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
    // then do not normalize the paths
    var normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '');
    allTestFiles.push(normalizedTestModule);
		console.log(normalizedTestModule);
		System.import(normalizedTestModule)
		//window.__karma__.start()
  }
})

System.config({
  // Karma serves files under /base, which is the basePath from your config file
  //baseUrl: '/base',
  baseUrl: '/',

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
})

/**/
//System.import('spec/expect.js')

describe( "main", function() {
		it("expected number of tests", function () {
			expect(allTestFiles.length).to.eql(9);
		})
})
/**/
console.log("what are you expecting? and when?")


