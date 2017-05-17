var CW = 800,
    CH = 800,
    ZOOM = 13;
var COORDS = [24.482385, 118.116398]; // Please use Google Earth coordinates
var T = 24.561485,
    B = 24.423250,
    R = 118.198504,
    L = 118.064743;
var WE = 13550,
    NS = 15388,
    GRID = 100; // meter
var NORTH, EAST, WEST, SOUTH,
    WIDTH, HEIGHT;
var x0, x1, y0, y1;
var RID, E;

function setup() {
    canvas = createCanvas(CW, CH);
    canvas.parent('canvas_view');
    noStroke();
    noLoop();
    from = color(0, 0, 255);
    to = color(255, 0, 0);
    init_map();
}

function init_grid() {
    // draw boundry
    x0 = (L - WEST) / WIDTH * CW;
    y0 = (NORTH - T) / HEIGHT * CH;
    x1 = (R - WEST) / WIDTH * CW;
    y1 = (NORTH - B) / HEIGHT * CH;
    stroke(255, 0, 0);
    noFill();
    rect(x0, y0, x1 - x0, y1 - y0);

    // draw grids
    noStroke();
    var dx = (x1 - x0) * GRID / WE,
        dy = (y1 - y0) * GRID / NS;
    var cx = 1;
    var dlr = (R - L) * GRID / WE,
        dbt = (T - B) * GRID / NS;
    var cnt = 0;
    for (var lr = L; lr < R; lr += dlr) {
        x = (lr - WEST) / WIDTH * CW;
        var cy = 1;
        for (var bt = T; bt > B; bt -= dbt) {
            y = (NORTH - bt) / HEIGHT * CH;
            if (RID[cy - 1][cx - 1] > 0) {
                //                console.log(cnt, E[cnt][0], E[cnt][1] * 10)
                c = lerpColor(from, to, E[cnt][1] * 10 / 255);
                fill(c);
                rect(x, y, dx, dy);
                //                stroke(255);
                //                text("[{0},{1}]".format(cy, cx), x + dx / 10, y + dy / 2);
                cnt += 1;
            }

            cy += 1;
        }
        cx += 1;
    }

}

function get_elevation() {
    ELE.getElevationForLocations({
        'locations': [{
            lat: ROAD[r][1],
            lng: ROAD[r][0]
            }]
    }, function (results, status) {
        console.log(r, results[0].elevation);
        r = r + 1;
        setTimeout(get_elevation, 100);
    });
}

// Google Maps ========================================================
function init_map() {
    var point = {
        lat: COORDS[0],
        lng: COORDS[1]
    };
    var map = new google.maps.Map(document.getElementById('map_view'), {
        zoom: ZOOM,
        center: point,
        mapTypeId: 'satellite'

    });

    ELE = new google.maps.ElevationService;

    google.maps.event.addListener(map, 'bounds_changed', function () {
        var bounds = map.getBounds();
        NORTH = bounds.getNorthEast().lat();
        SOUTH = bounds.getSouthWest().lat();
        EAST = bounds.getNorthEast().lng();
        WEST = bounds.getSouthWest().lng();
        WIDTH = EAST - WEST, HEIGHT = NORTH - SOUTH;
        //        console.log(NORTH, SOUTH, EAST, WEST, WIDTH, HEIGHT);

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