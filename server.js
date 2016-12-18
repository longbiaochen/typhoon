var express = require("express");
var bodyParser = require("body-parser");
var taxi = require("./api/taxi");
var damage = require("./api/damage");

var app = express();

// server setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("web"));

// server routers
app.get("/", function (req, res) {
    res.send("Hello World!")
});

app.get("/api/taxi/trajectory", function (request, response) {
    taxi.trajectory(request, response);
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

// run the server
app.listen(3000, function () {
    console.log("Starting server at 80...");
    console.log("Initializing databases...");
    taxi.init();
    damage.init();
    console.log("Server is ready.");
})