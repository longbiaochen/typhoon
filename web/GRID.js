var CW = 800,
    CH = 800,
    ZOOM = 15;
var COORDS = [24.484665, 118.116961]; // Please use Google Earth coordinates
var T = 24.561485,
    B = 24.423250,
    R = 118.198504,
    L = 118.064743;
var Nh = 154,
    Nw = 136;
var WE = 13550,
    NS = 15388,
    GRID = 100; // meter
var NORTH, EAST, WEST, SOUTH,
    WIDTH, HEIGHT;
var START_TIME = new Date('09/01/2016 00:00').getTime() / 1000,
    DURATION = 60 * 10;
var DATA = [];
var x0, x1, y0, y1;
var RID, E;

function setup() {
    canvas = createCanvas(CW, CH);
    canvas.parent('canvas_view');
    from = color(0, 0, 255, 200);
    to = color(255, 0, 0, 200);

    noLoop();
    init_map();

    [b, d, t] = geo({
        latitude: B,
        longitude: (L + R) / 2,
        timestamp: 0
    }, {
        latitude: T,
        longitude: (L + R) / 2,
        timestamp: 0
    });
    console.log(b, d, t);
}

function init_grid() {

    noStroke();
    $("#time_view").html("{0}".format(new Date(START_TIME * 1000)));
    for (index in DATA) {
        value = DATA[index];
        //        console.log(value.latitude / 1e6, value.longitude / 1e6)
        x = (value.longitude / 1e6 - WEST) / WIDTH * CW;
        y = (NORTH - value.latitude / 1e6) / HEIGHT * CH;
        fill(255, 0, 0, 200);
        ellipse(x, y, 3, 3);
    }

    x0 = (L - WEST) / WIDTH * CW;
    y0 = (NORTH - T) / HEIGHT * CH;
    x1 = (R - WEST) / WIDTH * CW;
    y1 = (NORTH - B) / HEIGHT * CH;
    console.log(x0, y0, x1, y1);
    stroke(255, 0, 0);
    noFill();
    rect(x0, y0, x1 - x0, y1 - y0);

    var dx = (x1 - x0) * GRID / WE,
        dy = (y1 - y0) * GRID / NS;
    var cx = 1;
    var cnt = 0;
    for (var lr = L; lr < R; lr += (R - L) / Nw) {
        x = (lr - WEST) / WIDTH * CW;
        var cy = 1;
        for (var bt = T; bt > B; bt -= (T - B) / Nh) {
            y = (NORTH - bt) / HEIGHT * CH;
            stroke(0, 0, 255);
            noFill();
            rect(x, y, dx, dy);
            //            stroke(255);
            //            text("[{0},{1}]".format(cy, cx), x + dx / 10, y + dy / 2);
            if (RID[cy - 1][cx - 1] > 0) {
                c = lerpColor(from, to, E[cnt][1] * 10 / 255);
                fill(c);
                rect(x, y, dx, dy);
                cnt += 1;
            }
            cy += 1;
        }
        cx += 1;
    }
}

// Google Maps ========================================================
function init_map() {
    if (URL_PARAMS.lat) {
        console.log(URL_PARAMS);
        COORDS[0] = Number(URL_PARAMS['lat']);
        COORDS[1] = Number(URL_PARAMS['lng']);

    }
    var point = {
        lat: COORDS[0],
        lng: COORDS[1]
    };
    console.log(point);

    var map = new google.maps.Map(document.getElementById('map_view'), {
        zoom: ZOOM,
        center: point,
        mapTypeId: 'satellite'

    });

    var marker = new google.maps.Marker({
        position: point,
        map: map
    });

    google.maps.event.addListener(map, 'bounds_changed', function () {
        var bounds = map.getBounds();
        NORTH = bounds.getNorthEast().lat();
        SOUTH = bounds.getSouthWest().lat();
        EAST = bounds.getNorthEast().lng();
        WEST = bounds.getSouthWest().lng();
        WIDTH = EAST - WEST, HEIGHT = NORTH - SOUTH;
        console.log(NORTH, SOUTH, EAST, WEST, WIDTH, HEIGHT);

        load_data();
    });

}

function load_data() {
    $.get("/rid.json", function (response) {
        RID = response.RID;
        $.get("/elevation.json", function (response) {
            E = response.E;
            init_grid();
        });
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

function geo(p1, p2) {
    var R = 6378137; // metres
    var φ1 = to_radian(p1.latitude);
    var φ2 = to_radian(p2.latitude);
    var Δφ = to_radian((p2.latitude - p1.latitude));
    var Δλ = to_radian((p2.longitude - p1.longitude));
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

var URL_PARAMS = {};
location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (s, k, v) {
    URL_PARAMS[k] = v;
})