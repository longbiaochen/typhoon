var SW = 800,
    SH = 800,
    DURATION = 600,
    INTERVAL = 500,
    ZOOM = 20,
    LNGOFFSET = -0.01155,
    LATOFFSET = -0.00320;
var COORDS = [118.127731, 24.485217],
    NORTH, EAST, WEST, SOUTH,
    WIDTH, HEIGHT;
var ISPLAYING;
var START_TIME = new Date('09/14/2016 09:00').getTime() / 1000;
var MAP;
var DATA = [],
    DICT = {},
    DIR = [];
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
    console.log(MAP.getDistance(bounds.getNorthEast(), bounds.getSouthWest()))
}

// P5 functions ==================================================
function setup() {
    canvas = createCanvas(SW, SH);
    canvas.parent('canvas_view');
    //    frameRate(30);
    textAlign(LEFT);
    textSize(24);
    C1 = color(255, 0, 0);
    C2 = color(0, 255, 0);
    noStroke();
    noLoop();

}

function draw() {
    var datetime = new Date(START_TIME * 1000);
    $("#time_view").html("{0}<br/>{1}".format(datetime, Object.keys(DICT).length));
    //    text(datetime + "    " + "Xiamen", 10, 30);
    //    text("Taxis: " + data.length, 650, 30);
    //    text("FPS: " + Math.round(frameRate()), 700, 780);
    //    background(0, 10);
    //
    //    for (index in DATA) {
    //        v = DATA[index];
    //        x = (v.longitude - WEST) / WIDTH * SW;
    //        y = (NORTH - v.latitude) / HEIGHT * SH;
    //        vp = DICT[v.vehicle];
    //        if (vp) {
    //            xp = (vp.longitude - WEST) / WIDTH * SW;
    //            yp = (NORTH - vp.latitude) / HEIGHT * SH;
    //            //            disp = Math.sqrt((yp - y) * (yp - y) + (xp - x) * (xp - x));
    //            //            console.log(disp);
    //            //            if (disp < 30) {
    //            //            ellipse(x, y, v.speed * 10 / 600, v.speed * 10 / 600);
    //            stroke(0, 0, 255, 100);
    //            line(xp, yp, x, y);
    //            noStroke();
    //            fill(255, 0, 0, 100);
    //            ellipse(x, y, 5, 5);
    //            ellipse(xp, yp, 5, 5);
    //
    //            dist = Math.sqrt((yp - y) * (yp - y) + (xp - x) * (xp - x));
    //            dt = v.timestamp - vp.timestamp;
    //            $("#speed_view").html("GPS Speed: {0} km/h<br/>Vehicle Speed: {1} km/h".format(dist / dt, v.speed / 10));
    //            //            } 
    //            //            d = Math.atan2(vp.latitude - v.latitude, vp.longitude - v.longitude);
    //            //            dp = DIR[v.vehicle];
    //            //            DIR[v.vehicle] = d;
    //            //            ang = abs(d - dp) * 180 / Math.PI;
    //            //            if (ang > 160 & ang < 200 & v.speed > 0) {
    //            //                console.log(v.vehicle);
    //            //                fill(255, 0, 0);
    //            //                ellipse(xp, yp, 5, 5);
    //            //    }
    //        }
    //    }
}

function mousePressed() {
    //    load_data();
    //    return;
    if (ISPLAYING) {
        noLoop();
        clearInterval(ISPLAYING);
        ISPLAYING = false;
    }
    else {
        loop();
        ISPLAYING = setInterval(load_data, INTERVAL);
    }
}

// data layer =======================================================
function load_data() {
    $.get("/api/taxi/trajectory", {
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
            MN = Math.round((MN + Object.keys(DICT).length) / 2);
        }
        draw();
        START_TIME += DURATION;
    });
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