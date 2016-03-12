var request = require("request-promise");
var Q = require("q");

exports.addTask = function(req, seeders, io, leecherPeerID) {
    return Q.promise(function(resolve, reject) {
    	request.head(req.body.url)
    	.then(function(response) {
            console.log(response);
            var x = response["content-length"];
            var n = seeders.length;
            var y = Math.floor(x/n);
            if(!n) reject(Error("There are no seeders available"));
            console.log("There are " + n + " seeders");
        	if(n-1)
            	for(var i=0; i<n-1; i++){
                    io.sockets.connected[seeders[i].id].emit("downloadTask", {
                        url: req.body.url,
                        startByte: y*i,
                        endByte: y*(i+1) - 1, // inclusive
                        index: i,
                        id: leecherPeerID,
                        totalsize: x
                    });
                }
            io.sockets.connected[seeders[n-1].id].emit("downloadTask", {
                url: req.body.url,
                startByte: y*(n-1),
                endByte: y*((n-1)+1) + x%n + 1, // inclusive
                index: (n-1),
                id: leecherPeerID,
                totalsize: x
            });
            resolve(response);
    	})
    	.catch(function() {
    		console.log("This site not legit yo");
    		reject(Error("Non legit site"));
    	});
	});
}