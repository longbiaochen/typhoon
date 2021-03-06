var SW = 800,
    SH = 800,
    DURATION = 60,
    INTERVAL = 200,
    ZOOM = 13,
    LNGOFFSET = -0.01155,
    LATOFFSET = -0.00320;
var COORDS = [118.127731, 24.485217],
    NORTH, EAST, WEST, SOUTH,
    WIDTH, HEIGHT;
var ISPLAYING;
var START_TIME = new Date('09/15/2016 07:00').getTime() / 1000;
var MAP;
var DATA = [],
    DICT = {},
    DIR = [],
    BEHAVIOR = [];
var canvas;
var index, value;
var v, x, y, p,
    vp, xp, yp, dp,
    ang;
var img;
var C1, C2;
var MN = 0;

// entry =========================================================
$(function () {
    $("#map_view").css({
        width: SW,
        height: SW
    });
    init_map();
    ISPLAYING = setInterval(load_data, INTERVAL);
    //    load_data();
});

// Baidu Map ========================================================
function init_map() {
    MAP = new BMap.Map("map_view");
    var point = new BMap.Point(COORDS[0], COORDS[1]);
    MAP.centerAndZoom(point, ZOOM);
    var bounds = MAP.getBounds();
    NORTH = (bounds.getNorthEast().lat + LATOFFSET) * 1e6, EAST = (bounds.getNorthEast().lng + LNGOFFSET) * 1e6;
    WEST = (bounds.getSouthWest().lng + LNGOFFSET) * 1e6, SOUTH = (bounds.getSouthWest().lat + LATOFFSET) * 1e6;
    WIDTH = EAST - WEST, HEIGHT = NORTH - SOUTH;
    console.log(NORTH, EAST, WEST, SOUTH, WIDTH, HEIGHT);
    console.log(MAP.getDistance(bounds.getNorthEast(), bounds.getSouthWest()));
}

// P5 functions ==================================================
function setup() {
    canvas = createCanvas(SW, SH);
    canvas.parent('canvas_view');
    //    frameRate(30);
    textAlign(LEFT);
    textSize(24);
    noLoop();
}

function draw() {
    //    text(datetime + "    " + "Xiamen", 10, 30);
    //    text("Taxis: " + data.length, 650, 30);
    //    text("FPS: " + Math.round(frameRate()), 700, 780);
    //    background(0, 10);
    //
    for (index in DATA) {
        v = DATA[index];
        x = (v.longitude - WEST) / WIDTH * SW;
        y = (NORTH - v.latitude) / HEIGHT * SH;
        vp = DICT[v.vehicle];
        if (vp) {
            xp = (vp.longitude - WEST) / WIDTH * SW;
            yp = (NORTH - vp.latitude) / HEIGHT * SH;
            stroke(0, 0, 255, 50);
            line(xp, yp, x, y);
            noStroke();
            fill(0, 255, 0, 50);
            ellipse(x, y, 5, 5);
            ellipse(xp, yp, 5, 5);
            [b, d, t] = geo(vp, v);
            $("#speed_view").html("{0}deg, {1}m, {2}s, {3}".format(Math.round(b), Math.round(d), t, v.status));
        }
    }

    for (index in BEHAVIOR) {
        v = BEHAVIOR[index];
        x = (v.longitude - WEST) / WIDTH * SW;
        y = (NORTH - v.latitude) / HEIGHT * SH;

        fill(255, 0, 0, 50);
        ellipse(x, y, 20, 20);
    }
}

function mousePressed() {
    //    load_data();
    //    return;
    if (ISPLAYING) {
        clearInterval(ISPLAYING);
        ISPLAYING = false;
        noLoop();
    }
    else {
        ISPLAYING = setInterval(load_data, INTERVAL);
        loop();
    }
}

// data layer =======================================================
function load_data() {
    $.get("/api/taxi/trajectory_one", {
        vehicle: 1000,
        start_time: START_TIME,
        duration: DURATION,
        north: NORTH,
        east: EAST,
        west: WEST,
        south: SOUTH
    }, function (response) {
        if (response.length) {
            DICT = {};
            $(DATA).each(function (id, val) {
                DICT[val['vehicle']] = val;
            });
            DATA = response;
            draw();

        }
        $("#time_view").html("{0} {1} ".format(new Date(START_TIME * 1000), Object.keys(DICT).length));

    });

    $.get("/api/taxi/behavior_one", {
        vehicle: 1000,
        start_time: START_TIME,
        duration: DURATION,
        north: NORTH,
        east: EAST,
        west: WEST,
        south: SOUTH
    }, function (response) {
        //        console.log(response);
        if (response.length) {
            BEHAVIOR = response;
        }
        draw();
    });

    START_TIME += DURATION;

}

// UTILITIES ========================================================
// string formatter
String.prototype.format = function () {
    var pattern = /\{\d+\}/g;
    var args = arguments;
    return this.replace(pattern, function (capture) {
        return args[capture.match(/\d+/)];
    });
};

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
    var t = p2.timestamp - p1.timestamp
    return [b, d, t];
};

function to_radian(d) {
    return d * Math.PI / 180;
};

function to_degree(r) {
    return r * 180 / Math.PI;
}