var request = require("request-promise");
var Q = require("q");

exports.addTask = function(req) {
    return Q.promise(function(resolve, reject) {
    	request.head(req.body.url)
    	.then(function(response) {
    		// Do something with the length here
    		return response;
    	})
    	.then(function(response) {
    		resolve(response);
    	})
    	.catch(function() {
    		console.log("This site not legit yo");
    		reject(Error("Non legit site"));
    	});
	});
}