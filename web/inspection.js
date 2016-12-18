var SIZE = 800;
var COORDS = [118.126867, 24.484466],
    NORTH, EAST, WEST, SOUTH,
    WIDTH, HEIGHT;
var START_TIME = new Date('09/15/2016 00:00').getTime() / 1000;
var data = [];
var canvas;
var index, value;
var x, y;
var img;

// entry =========================================================
$(function () {

});

// P5 functions ==================================================
function preload() {
    init_map();
    load_data();
}

function setup() {
    canvas = createCanvas(SIZE, SIZE);
    canvas.parent('canvas_view');
    //    frameRate(30);
    textAlign(LEFT);
    textSize(24);
    noStroke();
}

function draw() {

    //    fill(0);
    var datetime = new Date(START_TIME * 1000);
    //    text(datetime + "    " + "Xiamen", 10, 30);
    //    text("Taxis: " + data.length, 650, 30);
    //    text("FPS: " + Math.round(frameRate()), 700, 780);

    $("#data_view").html("{0}<br/>{1}".format(datetime, data.length));
    fill(255, 0, 0);
    for (index in data) {
        value = data[index];
        x = (value.longitude / 1e6 - WEST + .01155) / WIDTH * SIZE;
        y = (NORTH - value.latitude / 1e6 - .00310) / HEIGHT * SIZE;
        ellipse(x, y, 2, 2);
    }
}

// Baidu Map ========================================================
function init_map() {
    MAP = new BMap.Map("map_view");
    var point = new BMap.Point(COORDS[0], COORDS[1]);
    MAP.centerAndZoom(point, 18);
    var bounds = MAP.getBounds();
    NORTH = bounds.getNorthEast().lat, EAST = bounds.getNorthEast().lng;
    WEST = bounds.getSouthWest().lng, SOUTH = bounds.getSouthWest().lat;
    WIDTH = EAST - WEST, HEIGHT = NORTH - SOUTH;
    console.log(NORTH, EAST, WEST, SOUTH, WIDTH, HEIGHT);
}

// data layer =======================================================
function load_data() {
    $.get("/api/taxi/trajectory", {
        start_time: START_TIME,
        duration: 60,
        north: NORTH,
        east: EAST,
        west: WEST,
        south: SOUTH
    }, function (response) {
        data = response;
        //        stack.push(data);
        //        $("#data_view").html(stack.length);
        START_TIME += 60;
        load_data();
    })
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