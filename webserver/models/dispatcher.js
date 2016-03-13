var request = require("request-promise");
var Q = require("q");
var tasks = [];
var seeders = [];

exports.connectSeeder = function(id, username) {
    seeders.push({
        id: id,
        username: username
    });
    console.log(username + " is connected as a seeder");
    console.log("there are " + seeders.length + " seeders now");
    return true;
}

exports.disconnectSeeder = function(socketid) {
    var i = 0;
    for(; i<seeders.length; i++){
        if(seeders[i].id == socketid){
            seeders.splice(i,1);
            console.log("there are " + seeders.length + " seeders now");
            break;
        }
    }
}

exports.addTask = function(req, io) {
    return Q.promise(function(resolve, reject) {
    	request.head(req.body.url)
    	.then(function(response) {
            console.log(response);
            var x = response["content-length"];
            var n = seeders.length;
            var y = Math.floor(x/n);
            var id = req.user.username + Date.now();
            if(!n) reject(Error("There are no seeders available"));
            if(!x) reject(Error("This file server does not allow partial downloads"));
            console.log("There are " + n + " seeders");
        	if(n-1)
            	for(var i=0; i<n-1; i++){
                    seeders[i].task = 
                    io.sockets.connected[seeders[i].id].emit("downloadTask", {
                        url: req.body.url,
                        startByte: y*i,
                        endByte: y*(i+1) - 1, // inclusive
                        index: i,
                        id: id,
                        totalSize: x
                    });
                }
            io.sockets.connected[seeders[n-1].id].emit("downloadTask", {
                url: req.body.url,
                startByte: y*(n-1),
                endByte: y*((n-1)+1) + x%n + 1, // inclusive
                index: (n-1),
                id: id,
                totalSize: x
            });
            tasks.push({
                url: req.body.url,
                user: req.user.username,
                id: id
            });
            var filename = req.body.url.replace(/^.*[\\\/]/, '');
            resolve({
                "content-length": response["content-length"],
                url: req.body.url,
                id: id,
                seederNo: seeders.length,
                filename: filename
            });
    	})
    	.catch(function() {
    		reject(Error("Invalid URL"));
    	});
	});
}

exports.clearTask = function(taskid) {
    for(var i=0; i<tasks.length; i++){
        if(tasks[i].id == taskid){
            tasks[i].splice(i,1);
            break;
        }
    }
}