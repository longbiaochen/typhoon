var sqlite3 = require('sqlite3').verbose();

var taxi = {};

var db, query;
var start_time, end_time;
var privateFunction = function () {};

// API functions

taxi.init = function () {
    taxi_db = new sqlite3.Database("data/taxi.db", sqlite3.OPEN_READONLY);
    behavior_db = new sqlite3.Database("data/behavior.db", sqlite3.OPEN_READONLY);
    console.log("[taxi]: init complete.");
};

taxi.trajectory_one = function (request, response) {
    start_time = parseInt(request.query.start_time);
    end_time = start_time + parseInt(request.query.duration) - 1;
    query = "SELECT * FROM trajectory INDEXED BY indexes WHERE timestamp BETWEEN {0} AND {1} AND latitude BETWEEN {2} AND {3} AND longitude BETWEEN {4} AND {5} AND vehicle = {6};".format(start_time, end_time, request.query.south, request.query.north, request.query.west, request.query.east, request.query.vehicle);
    console.log(query);
    taxi_db.all(query, function (err, rows) {
        response.send(rows);
    });
}

taxi.trajectory = function (request, response) {
    start_time = parseInt(request.query.start_time);
    end_time = start_time + parseInt(request.query.duration) - 1;
    query = "SELECT * FROM trajectory INDEXED BY indexes WHERE timestamp BETWEEN {0} AND {1} AND latitude BETWEEN {2} AND {3} AND longitude BETWEEN {4} AND {5};".format(start_time, end_time, request.query.south, request.query.north, request.query.west, request.query.east);
    console.log(query);
    taxi_db.all(query, function (err, rows) {
        response.send(rows);
    });
}

taxi.trajectory_global = function (request, response) {
    start_time = parseInt(request.query.start_time);
    end_time = start_time + parseInt(request.query.duration) - 1;
    query = "SELECT * FROM trajectory INDEXED BY indexes WHERE BETWEEN {0} AND {1};".format(start_time, end_time);
    console.log(query);
    taxi_db.all(query, function (err, rows) {
        response.send(rows);
    });
}

taxi.behavior = function (request, response) {
    start_time = parseInt(request.query.start_time);
    end_time = start_time + parseInt(request.query.duration) - 1;
    query = "SELECT * FROM slow INDEXED BY indexes WHERE timestamp BETWEEN {0} AND {1} AND latitude BETWEEN {2} AND {3} AND longitude BETWEEN {4} AND {5};".format(start_time, end_time, request.query.south, request.query.north, request.query.west, request.query.east);
    console.log(query);
    behavior_db.all(query, function (err, rows) {
        response.send(rows);
    });
}

taxi.behavior_one = function (request, response) {
    start_time = parseInt(request.query.start_time);
    end_time = start_time + parseInt(request.query.duration) - 1;
    query = "SELECT * FROM slow INDEXED BY indexes WHERE timestamp BETWEEN {0} AND {1} AND latitude BETWEEN {2} AND {3} AND longitude BETWEEN {4} AND {5} AND vehicle = {6};".format(start_time, end_time, request.query.south, request.query.north, request.query.west, request.query.east, request.query.vehicle);
    console.log(query);
    behavior_db.all(query, function (err, rows) {
        response.send(rows);
    });
}

module.exports = taxi;

// string formatter
String.prototype.format = function () {
    var pattern = /\{\d+\}/g;
    var args = arguments;
    return this.replace(pattern, function (capture) {
        return args[capture.match(/\d+/)];
    });
};