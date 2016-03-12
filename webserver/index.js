var express = require("express");
var app = express();
require("./controllers/config.js")(app, express);
var passport = require("passport");
var http = require("http").Server(app);
var io = require('socket.io')(http);
var ensureAuthenticated = require("./middlewares/auth.js");
var connected = [];

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

// Socket.IO

io.on("connection", function(socket) {

})

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
    else res.render("signin", { layout: false });
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
    else res.render("signup", { layout: false });
});

app.post("/signup", passport.authenticate("local-signup", {
    successRedirect: "/",
    failureRedirect: "/signup"
}));

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
	res.render("downloading", {
		user: req.user
	})
})

// Listen

http.listen(3000, function(){
	console.log('listening on *:3000');
});