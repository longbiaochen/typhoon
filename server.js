var express = require("express");
var bodyParser = require("body-parser");
var taxi = require("./api/taxi");
var damage = require("./api/damage");
//var weibo = require("./api/weibo");
var proxy = require('express-http-proxy');

var app = express();

// server setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("web"));

// proxies
app.use('/api/weibo/nearby', proxy("https://api.weibo.com", {
    forwardPath: function (req, res) {
        console.log(require('url').parse(req.url).path)
        var path = require('url').parse(req.url).path;
        return "/2/place/nearby_timeline.json" + path.substring(1);
    },
    decorateRequest: function (proxyReq, originalReq) {
        console.log(proxyReq);
        return proxyReq;
    }
}));

// server routers
app.get("/", function (req, res) {
    res.send("Hello World!")
});

app.get("/api/taxi/trajectory", function (request, response) {
    taxi.trajectory(request, response);
});

app.get("/api/taxi/trajectory_one", function (request, response) {
    taxi.trajectory_one(request, response);
});

app.get("/api/taxi/trajectory_global", function (request, response) {
    taxi.trajectory_global(request, response);
});

app.get("/api/taxi/behavior", function (request, response) {
    taxi.behavior(request, response);
});

app.get("/api/taxi/behavior_one", function (request, response) {
    taxi.behavior_one(request, response);
});

app.get("/api/taxi/grid", function (request, response) {
    taxi.grid(request, response);
});

app.get("/api/damage/query", function (request, response) {
    damage.query(request, response);
});

app.post("/api/damage/report", function (request, response) {
    damage.report(request, response);
});

app.post("/api/damage/delete", function (request, response) {
    damage.delete(request, response);
});

//app.get("/api/weibo/nearby", function (request, response) {
//    weibo.nearby(request, response);
//});

// run the server
app.listen(3000, function () {
    console.log("Starting server at 80...");
    console.log("Initializing databases...");
    taxi.init();
    damage.init();
    //    weibo.init();
    console.log("Server is ready.");
})