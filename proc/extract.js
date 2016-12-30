var sqlite3 = require('sqlite3').verbose();

var db, query;
var start_time, end_time;
var privateFunction = function () {};
var VTHRES = 60, // meters
    TTHRES = 120; // seconds

taxi_db = new sqlite3.Database("data/taxi.db", sqlite3.OPEN_READONLY);
console.log("Connected to taxi database.");

behavior_db = new sqlite3.Database("data/behavior.db");
console.log("Connected to behavior database.");

behavior_db.run("DELETE FROM slow", function (err) {
    if (err) {
        console.log(err);
        return;
    }
});

taxi_db.all("SELECT vid FROM vid", function (err, rows) {
    for (var idx in rows) {
        query = "SELECT * FROM trajectory INDEXED BY vehicle_index WHERE vehicle = {0} ORDER BY timestamp;".format(rows[idx].vid);
        taxi_db.serialize(function () {
            taxi_db.all(query, function (err, rows) {
                // for each vehicle
                var p, sp, ep, b, d, t, r;
                var inseg = false,
                    pc = 0;
                var stmt = behavior_db.prepare("INSERT INTO slow VALUES(?,?,?,?,?,?)");
                sp = ep = rows[0];
                for (var i = 1; i < rows.length; i++) {
                    p = rows[i];
                    t = p.timestamp - ep.timestamp;
                    if (t < 60) { // filter status change package
                        continue;
                    }
                    [b, d] = geo(ep, p);
                    if (d < VTHRES && t < TTHRES) {
                        if (inseg) {}
                        else {
                            inseg = true;
                        }
                        ep = p;
                        pc += 1;
                    }
                    else {
                        if (inseg) {
                            inseg = false;
                            if (pc > 1) {
                                r = [sp.vehicle, Math.round( (sp.latitude + ep.latitude) / 2), Math.round( (sp.longitude + ep.longitude) / 2), sp.timestamp, ep.timestamp - sp.timestamp, pc];
                                stmt.run(r);
                            }
                        }
                        sp = ep = p;
                        pc = 0;
                    }
                }
                stmt.finalize();
                console.log("Finished: ", sp.vehicle);
            });
        });
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

function geo(p1, p2) {
    var R = 6371e3; // metres
    var φ1 = to_radian(p1.latitude / 1e6);
    var φ2 = to_radian(p2.latitude / 1e6);
    var Δφ = to_radian((p2.latitude - p1.latitude) / 1e6);
    var Δλ = to_radian((p2.longitude - p1.longitude) / 1e6);
    var θ = Math.atan2(Math.sin(Δλ) * Math.cos(φ2), Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ));
    var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    var b = (to_degree(θ) + 360) % 360;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return [b, d];
};

function to_radian(d) {
    return d * Math.PI / 180;
};

function to_degree(r) {
    return r * 180 / Math.PI;
}