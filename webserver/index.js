var express = require("express");
var app = express();
require("./controllers/config.js")(app, express);
var passport = require("passport");
var http = require("http").Server(app);
var io = require('socket.io')(http);
var ensureAuthenticated = require("./middlewares/auth.js");
var connected = [];
var dispatcher = require("./models/dispatcher.js");
var user = require("./models/user.js");
var seeders = [];
var leechers = [];

// Public directory
app.use(express.static(__dirname + '/public'));

// allow CORS

app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
	if (req.method == 'OPTIONS') {
		res.status(200).end();
	} else {
		next();
	}
});

// Socket.IO for leecher

io.on("connection", function(socket) {
	socket.on("seederDetails", function(username) {
		dispatcher.connectSeeder(socket.id, username);
	});
	socket.on('disconnect', function() {
		dispatcher.disconnectSeeder(socket.id);
   });
});

// Login and logout

app.get("/logout", ensureAuthenticated, function(req, res) {
    req.logout();
    res.redirect("/");
});

app.get("/signin", function(req, res) {
    if (req.user) {
        req.session.warning = "You are already signed in";
        res.redirect(req.headers.referer || "/");
    }
    else res.render("signin", {});
});

app.post("/signin", passport.authenticate("local-signin", {
    successRedirect: "/",
    failureRedirect: "/signin"
}));

app.get("/signup", function(req, res) {
    if (req.user) {
        req.session.warning = "You are already signed in";
        res.redirect(req.headers.referer || "/");
    }
    else res.render("signup", {});
});

app.post("/signup", passport.authenticate("local-signup", {
    successRedirect: "/",
    failureRedirect: "/signup"
}));

// Login and logout APIs

app.post("/apisignin", function(req, res) {
	user.authenticate(req.body.username, req.body.password)
	.then(function(user) {
		console.log(user);
		res.send(JSON.stringify(user));
	})
	.fail(function(err) {
		console.log(err);
		res.send('{"type": "error"}');
	})
});

app.post("/apisignup", function(req, res) {
	user.create(req, req.body.username, req.body.password)
	.then(function(user) {
		console.log(user);
		res.send(JSON.stringify(user));
	})
	.fail(function(err) {
		console.log(err);
		res.send('{"type": "error"}');
	})
});

// Main routes

app.get('/', function(req, res){
	if(req.user){
		res.render("homepage", {
			user: req.user
		})
	}
	else
		res.render("landing", {});
});

app.post("/download", ensureAuthenticated, function(req, res) {
	dispatcher.addTask(req, io)
	.then(function(details) {
		res.render("download", {
			user: req.user,
			details: details
		})
	})
	.fail(function(err) {
		res.render("download", {
			user: req.user,
			details: {'content-length': err	}
		})
	})
})

app.post("/payout", ensureAuthenticated, function(req, res) {
	user.payout(req.body.taskid)
	.then(function(task) {
		res.send("Successfully removed task");
	})
})


app.post("/complete", ensureAuthenticated, function(req, res) {
	dispatcher.clearTask(req.body.taskid)
	.then(function(task) {
		res.send("Successfully removed task");
	})
})

// Listen

http.listen(3000, function(){
	console.log('listening on *:3000');
});