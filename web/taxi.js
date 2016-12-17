var NORTH = 24.616651115569763,
    EAST = 118.26972260156253,
    WEST = 117.99506439843753,
    SOUTH = 24.366706529319718;
var WIDTH = EAST - WEST,
    HEIGHT = NORTH - SOUTH,
    CENTER = (EAST + WEST) / 2,
    MIDDLE = (NORTH + SOUTH) / 2;
var SIZE = 800;
var START_TIME = 1473868800;
var data = [];
var canvas;
var index, value;
var x, y;
var img;

// entry =========================================================
$(function () {
    console.log("App is loaded.");
    load_data();
});

// P5 functions ==================================================
function preload() {
    img = loadImage("/img/bg.png");
}

function setup() {
    canvas = createCanvas(SIZE, SIZE);
    canvas.parent('canvas_view');
    background(0);
    //    frameRate(30);
    textAlign(LEFT);
    textSize(24);
    noStroke();
}

function draw() {
    tint(255, 80);
    image(img, 0, 0, SIZE, SIZE);
    fill(255);
    var datetime = new Date(START_TIME * 1000);
    text(datetime + "    " + "Xiamen", 10, 30);
    text("Taxis: " + data.length, 650, 30);
    text("FPS: " + Math.round(frameRate()), 700, 780);
    fill(255, 0, 0);
    for (index in data) {
        value = data[index];
        x = (value.longitude / 1e6 - WEST + .0047) / WIDTH * SIZE;
        y = (NORTH - value.latitude / 1e6 + .0027) / HEIGHT * SIZE;
        ellipse(x, y, 2, 2);
    }
}

// Google Maps =====================================================
function init_map() {
    map = new google.maps.Map(document.getElementById('map_view'), {
        center: {
            lat: MIDDLE,
            lng: CENTER
        },
        zoom: 12,
        disableDefaultUI: true
    });
    map.addListener('bounds_changed', function () {
        var ne = map.getBounds().getNorthEast();
        var sw = map.getBounds().getSouthWest();
        console.log(ne.lat(), ne.lng(), sw.lat(), sw.lng());
    });
    map.mapTypes.set('styled_map', new google.maps.StyledMapType(map_style));
    map.setMapTypeId('styled_map');
}

// data layer =======================================================
function load_data() {
    $.get("/api/taxi/trajectory", {
        start_time: START_TIME,
        duration: 60
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