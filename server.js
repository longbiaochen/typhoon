var express = require("express");
var taxi = require("./api/taxi");
var app = express();
app.use(express.static("web"));
app.get("/", function (req, res) {
    res.send("Hello World!")
});
app.get("/api/taxi/trajectory", function (request, response) {
    taxi.trajectory(request, response);
});
app.listen(3000, function () {
    console.log("Starting server at 80...");
    console.log("Initializing databases...");
    taxi.init();
    console.log("Server is ready.");
})