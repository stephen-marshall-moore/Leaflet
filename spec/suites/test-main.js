var tests = [];

for (var file in window.__karma__.files) {
	if (window.__karma__.files.hasOwnProperty(file)) {
		if (/Spec\.js$/.test(file)) {
			console.log(file.substring(18));
			tests.push(file.substring(18));
		}
	}
}

for (var i = 0; i < tests.length; ++i) {
	console.log( "importing ... ", tests[i] );
  System
      .import(tests[i])
      .then(function() {
          console.log("thenned");
          //done();
      })
      .catch(function(e) {
          console.log('>>> ', e.message);
          done();
      });
}

