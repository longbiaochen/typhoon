var sqlite3 = require('sqlite3').verbose();

var taxi = {};

var db, query;
var start_time, end_time;
var privateFunction = function () {};

// API functions

taxi.init = function () {
    db = new sqlite3.Database("taxi.db", sqlite3.OPEN_READONLY);
    console.log("[taxi]: init complete.");
};

taxi.trajectory = function (request, response) {
    start_time = parseInt(request.query.start_time);
    end_time = start_time + parseInt(request.query.duration);
    query = "SELECT * FROM trajectory WHERE timestamp >= {0} AND timestamp < {1} AND latitude >= {2} AND latitude <= {3} AND longitude >= {4} AND longitude <= {5}".format(start_time, end_time, request.query.west, request.query.east, request.query.south, request.query.north);
    db.all(query, function (err, rows) {
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