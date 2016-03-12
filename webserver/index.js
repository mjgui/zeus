var express = require("express");
var app = express();
require("./controllers/config.js")(app, express);
var passport = require("passport");
var http = require("http").Server(app);
var ensureAuthenticated = require("./middlewares/auth.js");

app.get('/', function(req, res){
	res.render("homepage", {
		user: req.user
	});
});

app.get("/logout", ensureAuthenticated, function(req, res) {
    session.remove(req.user.username)
    .then(function() {
        console.log("Logged " + req.user.username + " out");
        req.logout();
        res.redirect("/");
    })
    .fail(function() {
        console.log("Failed to log " + req.user.username + " out");
        req.session.error = "An error was encountered while processing your request";
        res.redirect(req.headers.referer || "/");
    });
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

http.listen(3000, function(){
  console.log('listening on *:3000');
});