var CW = 800,
    CH = 800,
    DURATION = 600,
    ZOOM = 13,
    LNGOFFSET = -0.01155,
    LATOFFSET = -0.00320;
var COORDS = [118.157148, 24.504722];
var T = 24.561240,
    R = 118.202504,
    L = 118.068150,
    B = 24.423417;
var WE = 13587,
    NS = 15325,
    GRID = 100; // meter
var NORTH, EAST, WEST, SOUTH,
    WIDTH, HEIGHT;
var x0, x1, y0, y1;

// P5 functions ==================================================
function setup() {
    init_map();

    canvas = createCanvas(CW, CH);
    canvas.parent('canvas_view');

    x0 = (L - WEST) / WIDTH * CW;
    y0 = (NORTH - T) / HEIGHT * CH;
    x1 = (R - WEST) / WIDTH * CW;
    y1 = (NORTH - B) / HEIGHT * CH;
    console.log(x0, y0, x1, y1);
    stroke(255, 0, 0);
    noFill();
    rect(x0, y0, x1 - x0, y1 - y0);
    noLoop();

    [b, d, t] = geo({
        latitude: T * 1e6,
        longitude: L * 1e6,
        timestamp: 0
    }, {
        latitude: B * 1e6,
        longitude: L * 1e6,
        timestamp: 0
    });
    console.log(b, d, t);

    stroke(0, 0, 255, 100);
    var cnt = 0;
    for (var lr = L; lr < R; lr += (R - L) * GRID / WE) {
        x = (lr - WEST) / WIDTH * CW;
        line(x, y0, x, y1);
        cnt += 1;
    }
    console.log(cnt);
    cnt = 0;
    for (var bt = B; bt < T; bt += (T - B) * GRID / NS) {
        y = (NORTH - bt) / HEIGHT * CH;
        line(x0, y, x1, y);
        cnt += 1;
    }
    console.log(cnt);
}

function draw() {

}

// Baidu Map ========================================================
function init_map() {
    MAP = new BMap.Map("map_view");
    var point = new BMap.Point(COORDS[0], COORDS[1]);
    MAP.centerAndZoom(point, ZOOM);
    var bounds = MAP.getBounds();
    NORTH = bounds.getNorthEast().lat + LATOFFSET;
    EAST = bounds.getNorthEast().lng + LNGOFFSET;
    WEST = bounds.getSouthWest().lng + LNGOFFSET;
    SOUTH = bounds.getSouthWest().lat + LATOFFSET;
    WIDTH = EAST - WEST, HEIGHT = NORTH - SOUTH;
    //    console.log(NORTH, EAST, WEST, SOUTH, WIDTH, HEIGHT);
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