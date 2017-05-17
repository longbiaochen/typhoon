require("jsdom").env("", function (err, window) {
    $ = require("jquery")(window);
});

var WEIBO = {};
var ACCESS_TOKEN = "2.002esERCsM3KZEfd14150a44h2zkFB";

// API functions

WEIBO.init = function () {
    console.log("[WEIBO]: init complete.");
};

WEIBO.nearby = function (request, response) {
    console.log("here");
    $.get('https://api.weibo.com/2/place/nearby_timeline.json', {
        access_token: ACCESS_TOKEN,
        lat: request.query.lat,
        long: request.query.lng,
        starttime: request.query.starttime,
        endtime: request.query.endtime,
        count: request.query.count
    }, function (err, res, body) {
        console.log(res);
        response.send(res);
    });
}

module.exports = WEIBO;

// string formatter
String.prototype.format = function () {
    var pattern = /\{\d+\}/g;
    var args = arguments;
    return this.replace(pattern, function (capture) {
        return args[capture.match(/\d+/)];
    });
};