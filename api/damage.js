// API FUNCTIONSS
var damage = {};

damage.init = function () {

}

damage.query = function (request, response) {
    console.log(request.query);
    // TODO
    var data = [{
        coordinates: [118.127532, 24.48469],
        date: "2016-09-15",
        time: "03:00",
        timestamp: "1473879600",
        damage_type: "fallen trees",
        damage_impact: "blocked lane",
        source_url: "http://weibo.com/1750354532/E8nYioiz8",
        damage_id: "abdd4de8-2137-d8ab-702e-8a4773b9b181"
    }, {
        coordinates: [118.120945, 24.43594],
        date: "2016-12-16",
        time: "14:04",
        timestamp: "1481868240",
        damage_type: "puddle",
        damage_impact: "blocked road",
        source_url: "http://weibo.com/1750354532/E8nYioiz8",
        damage_id: "5465c44f-7ef6-d718-929b-ce9d8963fa68"
    }];
    // TODO
    response.send(data);
}

damage.report = function (request, response) {
    console.log(request.body);
    // TODO
    response.send("duplicated damage id.");
}

damage.delete = function (request, response) {
    console.log(request.body);
    // TODO
    response.send({
        damage_id: request.body.damage_id
    });
}

module.exports = damage;

// UTILITIES
String.prototype.format = function () {
    var pattern = /\{\d+\}/g;
    var args = arguments;
    return this.replace(pattern, function (capture) {
        return args[capture.match(/\d+/)];
    });
};