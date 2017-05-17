var CW = 800,
    CH = 800,
    ZOOM = 15;
var COORDS = [24.485521, 118.116765]; // Please use Google Earth coordinates
var T = 24.561485,
    B = 24.423250,
    R = 118.198504,
    L = 118.064743;
var WE = 13550,
    NS = 15388,
    GRID = 100; // meter
var NORTH, EAST, WEST, SOUTH,
    WIDTH, HEIGHT;
var START_TIME = new Date('09/07/2016 00:00').getTime() / 1000,
    END_TIME = new Date('09/10/2016 00:00').getTime() / 1000;
var MAP, CENTER;
var ACCESS_TOKEN = "2.002esERCsM3KZEfd14150a44h2zkFB";
var DATA;
var TEMPLATE = "<tr class='node' id='node_{0}'><td>{0}</td><td>{1}</td><td>{2}</td><td><a href={3} target='_blank'>Image</a></td></tr>";

$(function () {
    $("#load_btn").on("click", function () {
        load_data();
    });

    init_map();
    //    load_data();
});

// Google Maps ========================================================
function init_map() {
    var point = {
        lat: COORDS[0],
        lng: COORDS[1]
    };

    MAP = new google.maps.Map(document.getElementById('map_view'), {
        zoom: ZOOM,
        center: point,
        mapTypeId: 'satellite'
    });

    CENTER = new google.maps.Marker({
        position: point,
        map: MAP
    });

    MAP.addListener('click', function (e) {
        CENTER.setMap(null);
        CENTER = new google.maps.Marker({
            position: e.latLng,
            map: MAP
        });
        MAP.panTo(e.latLng);
    });

}

function load_data() {
    $.get("/api/weibo/nearby", {
        //    $.get("/t.json", {
        access_token: ACCESS_TOKEN,
        lat: CENTER.position.lat(),
        long: CENTER.position.lng(),
        starttime: START_TIME,
        endtime: END_TIME,
        range: 1000,
        count: 50
    }, function (response) {
        console.log(response.total_number);
        DATA = response.statuses;
        show_data();
    }, 'json');
}

function show_data() {
    $.each(DATA, function (index, value) {
        var node = TEMPLATE.format(index, value.text, value.user.name, value.bmiddle_pic);
        $('#data_view').append(node);
        var lat = value.geo.coordinates[0];
        var lng = value.geo.coordinates[1];
        var gcj02towgs84 = coordtransform.gcj02towgs84(lng, lat);

        var marker = new google.maps.Marker({
            id: index,
            position: {
                lat: gcj02towgs84[1],
                lng: gcj02towgs84[0]
            },
            icon: "http://maps.google.com/mapfiles/kml/pal2/icon18.png",
            map: MAP
        });

        google.maps.event.addListener(marker, 'click', function (e) {
            console.log(marker.id);
            $(".node").css({
                "background-color": "white"
            });
            $("#node_{0}".format(marker.id)).css({
                "background-color": "rgba(255, 0, 0, 0.5)"
            });

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