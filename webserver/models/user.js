var bcryptjs = require("bcryptjs");
var Q = require("q");
var Datastore = require("nedb");
var users = new Datastore({filename: './database/users', autoload: true});

exports.all = function() {
    return Q.promise(function(resolve, reject) {
        Q.ninvoke(users, "find", {})
        .then(function(list) {
            resolve(list);
        })
        .fail(function() {
            reject(Error("Failed to get user list"));
        });
    });
};

exports.authenticate = function(username, password) {
    return Q.promise(function(resolve, reject) {
        Q.ninvoke(users, "findOne", { username: username })
        .then(function(user) {
            if (!user)
                return reject(Error("User not found: " + username));
            Q.ninvoke(bcryptjs, "compare", password, user.password)
            .then(function(flag) {
                if (flag)
                    return resolve(user);
                return reject(Error("Wrong Password for user: " + username));
            });
        })
        .fail(function() {
            reject(Error("Authentication failed"));
        });
    });
};

exports.create = function(req, username, password) {
    return Q.promise(function(resolve, reject) {
        username = username.toLowerCase();
        if (password !== req.body.password2)
            return reject("Passwords Mismatch");
        Q.ninvoke(users, "count", { username: username })
        .then(function(count) {
            if (count)
                return reject(Error("Username in use: " + username));
            return Q.ninvoke(bcryptjs, "hash", password, 10);
        })
        .then(function(password) {
            var user = {
                "username": username,
                "password": password,
                "bytes": 0,
                "balance": 0.0
            };
            return Q.ninvoke(users, "insert", user);
        })
        .then(function(user) {
            resolve(user);
        })
        .fail(function(err) {
            console.error(err);
            reject(Error("User creation failed"));
        });

    });
};

exports.get = function(id) {
    return Q.promise(function(resolve, reject) {
        Q.ninvoke(users, "findOne", { _id: id })
        .then(function(result) {
            resolve(result);
        })
        .fail(function() {
            reject(Error("Failed to get user information"));
        });
    });
};

exports.payout = function(name, addamount) {
    return Q.promise(function(resolve, reject) {
        Q.ninvoke(users, "findOne", { username: name })
        .then(function(user) {
            Q.ninvoke(users, "update", { username: user }, { $set: {balance : user.balance + addamount} })
            .then(function() {
                resolve("Updated user");
            })
            .fail(function() {
                reject(Error("Failed to update user"));
            });
        })
        .fail(function() {
            reject(Error("User update failed"));
        });
    });
};