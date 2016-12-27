var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
eval(fs.readFileSync('proc/bmap.js') + '');

var db, query;
var start_time, end_time;
var privateFunction = function () {};

db = new sqlite3.Database("taxi.db", sqlite3.OPEN_READONLY);
console.log("Connected to database.");

db.all("SELECT vid FROM vid", function (err, rows) {
    for (var idx in rows) {
        query = "SELECT * FROM trajectory INDEXED BY vehicle WHERE vehicle = {0};".format(rows[idx].vid);
        console.log(query);
        db.all(query, function (err, rows) {
            // for each vehicle
            var cp, pp, sp, dist;
            for (var idx in rows) {
                //                console.log(rows[idx].timestamp)
                cp = rows[idx];
                pp = cp;
                dist = Math.sqrt(Math.pow((cp.latitude - pp.latitude), 2) + Math.pow((cp.longitude - pp.longitude), 2));
                console.log(console.log(MAP.getDistance(new BMap.Point(cp.latitude, cp.longitude), new BMap.Point(cp.latitude, cp.longitude))));
            }
        });
        break;
    };
});

// string formatter
String.prototype.format = function () {
    var pattern = /\{\d+\}/g;
    var args = arguments;
    return this.replace(pattern, function (capture) {
        return args[capture.match(/\d+/)];
    });
}