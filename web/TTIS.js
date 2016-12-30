var CW = 800,
    CH = 800,
    DURATION = 600,
    ZOOM = 20,
    LNGOFFSET = -0.01155,
    LATOFFSET = -0.00320;
var COORDS = [118.127731, 24.485217],
    BOX = [118.127983, 24.485675, 118.127462, 24.484886],
    NORTH, EAST, WEST, SOUTH,
    WIDTH, HEIGHT;
var ISPLAYING = true;
var START_TIME = new Date('09/12/2016 00:00').getTime() / 1000;
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
var x0, x1, y0, y1;
var TRACE;

// entry =========================================================
$(function () {
    $("#map_view").css({
        width: CW,
        height: CH
    });
    init_map();

    BOX[0] = (BOX[0] + LNGOFFSET) * 1e6;
    BOX[1] = (BOX[1] + LATOFFSET) * 1e6;
    BOX[2] = (BOX[2] + LNGOFFSET) * 1e6;
    BOX[3] = (BOX[3] + LATOFFSET) * 1e6;

    load_data();

    TRACE = {
        x: [],
        y: [] // number of vehicles
    };
    Plotly.newPlot('data_view', [TRACE]);

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
}

// P5 functions ==================================================
function setup() {
    canvas = createCanvas(CW, CH);
    canvas.parent('canvas_view');
    //    frameRate(30);
    textAlign(LEFT);
    textSize(24);
    x0 = (BOX[2] - WEST) / WIDTH * CW;
    x1 = (BOX[0] - WEST) / WIDTH * CW;
    y0 = (NORTH - BOX[1]) / HEIGHT * CH;
    y1 = (NORTH - BOX[3]) / HEIGHT * CH;
    noFill();
    stroke(255, 0, 0);
    rect(x0, y0, x1 - x0, y1 - y0);
    noLoop();
}

function draw() {
    $("#time_view").html("{0}<br>{1} ".format(new Date(START_TIME * 1000), Object.keys(DICT).length));
    clear();
    noFill();
    stroke(255, 0, 0);
    rect(x0, y0, x1 - x0, y1 - y0);
    noStroke();
    fill(0, 0, 255);
    for (index in DATA) {
        v = DATA[index];
        x = (v.longitude - WEST) / WIDTH * CW;
        y = (NORTH - v.latitude) / HEIGHT * CH;
        ellipse(x, y, 5, 5);

        //        vp = DICT[v.vehicle];
        //        if (vp) {
        //            xp = (vp.longitude - WEST) / WIDTH * CW;
        //            yp = (NORTH - vp.latitude) / HEIGHT * CH;
        //            stroke(0, 0, 255, 50);
        //            line(xp, yp, x, y);
        //            noStroke();
        //            fill(0, 255, 0, 50);
        //            ellipse(x, y, 5, 5);
        //            ellipse(xp, yp, 5, 5);
        //                [b, d, t] = geo(vp, v);
        //            $("#speed_view").html("{0}deg, {1}m, {2}s, {3}".format(Math.round(b), Math.round(d), t, v.status));
        //        }
    }

    //    background(0, 5);
    //    for (index in BEHAVIOR) {
    //        v = BEHAVIOR[index];
    //        x = (v.longitude * 1e6 - WEST) / WIDTH * CW;
    //        y = (NORTH - v.latitude * 1e6) / HEIGHT * CH;
    //        noStroke();
    //        fill(255, 0, 0, 50);
    //        ellipse(x, y, 5, 5);
    //    }
}

function mousePressed() {
    ISPLAYING = !ISPLAYING;
    console.log(ISPLAYING);
    load_data();
}

// data layer =======================================================
function load_data() {
    //    
    $.get("/api/taxi/trajectory", {
        start_time: START_TIME,
        duration: DURATION,
        north: BOX[1],
        east: BOX[0],
        west: BOX[2],
        south: BOX[3]
    }, function (response) {
        if (response.length) {
            DATA = response;
            DICT = {};
            $(DATA).each(function (id, val) {
                DICT[val['vehicle']] = val;
            });
            TRACE.x.push(new Date(START_TIME * 1000));
            TRACE.y.push(Object.keys(DICT).length);
            Plotly.redraw('data_view');
            draw();
        }
        if (ISPLAYING) {
            START_TIME += DURATION;
            load_data();
        }

    });
    //
    //    $.get("/api/taxi/behavior", {
    //        start_time: START_TIME,
    //        duration: DURATION,
    //        north: NORTH,
    //        east: EAST,
    //        west: WEST,
    //        south: SOUTH
    //    }, function (response) {
    //        //        console.log(response);
    //        if (response.length) {
    //            BEHAVIOR = response;
    //        }
    //        draw();
    //    });
    //

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