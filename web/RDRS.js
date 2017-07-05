// @author: longbiaochen@icloud.com
var CENTER = 118.13239350000003,
    MIDDLE = 24.49167882244474;
var ZOOM = 13;
var SIZE = 800;
var START_TIME = 1473868800;
var DAMAGE_DATA = [];
var MAP;
var T = 24.561485,
    B = 24.423250,
    R = 118.198504,
    L = 118.064743;
var Nh = 154,
    Nw = 136;
var MARKERS = [];

// ENTRY =========================================================
$(function () {
    init_map();

    // UI listeners ----------------------------------------------
    $("#source_url_checker").on("click", function () {
        var url = $("#source_url").val();
        window.open(url, '_blank');
    });

    $("#new_button").on("click", function () {});

    $("#report_button").on("click", function () {
        var item = {};
        $(".damage-field").each(function (id, field) {
            item[field.id] = $(field).val();
        });
        console.log(item);
        $.post("/api/damage/report", {
            item: item
        }, function (response) {
            console.log(response);
            switch (response.status) {
            case "SUCCESS":
                $("#success_alert").html("Report success.").slideDown().delay(1500).slideUp();
                load_damage_data();
                break;
            default:
                $("#error_alert").html("ERROR: " + response).slideDown();
                break;
            }
        }, "json"); // NOTE: setting "json" to ensure post body parsing
    });

    $("#delete_button").on("click", function () {
        var damage_id = $("#damage_id").val();
        $.post("/api/damage/delete", {
            damage_id: damage_id
        }, function (response) {
            switch (response.status) {
            case "SUCCESS":
                $(".damage-field").each(function (id, field) {
                    $(field).val("");
                });
                $("#success_alert").html("Delete success.").slideDown().delay(1500).slideUp();
                load_damage_data();
                break;
            default:
                $("#error_alert").html("ERROR: " + response).slideDown();
                break;
            }
        }, "json");

    });
});

// FUNCTIONS =====================================================
function init_map() {
    MAP = new google.maps.Map(document.getElementById('map_view'), {
        zoom: ZOOM,
        center: {
            lat: MIDDLE,
            lng: CENTER
        },
        mapTypeId: "satellite"
    });
    MAP.addListener("rightclick", function (event) {
        // new a report
        $(".damage-field").each(function (id, field) {
            $(field).val("");
        });
        var damage_id = guid();
        $("#damage_id").val(damage_id);
        $("#damage_link").attr('href', '/street_views/{0}.png'.format(damage_id));
        var lat = event.latLng.lat().toFixed(6),
            lng = event.latLng.lng().toFixed(6);
        $("#coordinates").val("{0},{1}".format(lat, lng));
        var wid = Math.ceil((lng - L) * Nw / (R - L)),
            hid = Math.ceil((T - lat) * Nh / (T - B));
        $("#grid_number").val([hid, wid]);
        $("#grid_link").attr('href', '/GRID.html?lat={0}&lng={1}'.format(lat, lng));
        $("#damage_type").val("fallen trees");
        $("#damage_impact").val("lane blocked");
    })

    load_damage_data();
}

function load_damage_data() {
    $.get("/api/damage/query", function (response) {
        // clear existing markers
        for (var i = 0; i < MARKERS.length; i++) {
            MARKERS[i].setMap(null);
        }
        // update map
        DAMAGE_DATA = response;
        $.each(DAMAGE_DATA, function (index, value) {
            console.log(value.grid_number)
            var icon;
            switch (value.damage_type) {
            case "fallen trees":
                icon = "/img/fallen_tree.png";
                break;
            case "ponding water":
                icon = "/img/ponding_water.png";
                break;
            default:
                icon = "/img/placeholder.png";
            }
            var marker = new google.maps.Marker({
                id: index,
                position: {
                    lat: Number(value.coordinates.split(',')[0]),
                    lng: Number(value.coordinates.split(',')[1])
                },
                icon: icon,
                map: MAP
            });
            marker.addListener("click", function () {
                show_damage_info(index);
            });
            MARKERS.push(marker);
        });
    });
}

function show_damage_info(index) {
    var item = DAMAGE_DATA[index];
    $.each(item, function (id, val) {
        $("#" + id).val(val);
    });
    var coordinates = $("#coordinates").val().split(",");
    var damage_id = $("#damage_id").val();
    $("#grid_link").attr('href', '/GRID.html?lat={0}&lng={1}'.format(coordinates[0], coordinates[1]));
    $("#damage_link").attr('href', '/street_views/{0}.png'.format(damage_id));
}

// not used any more
function update_coordinates() {
    var bd09 = $("#coordinates").val().split(",");
    var gcj02 = coordtransform.bd09togcj02(bd09[0], bd09[1]);
    var wgs84 = coordtransform.gcj02towgs84(gcj02[0], gcj02[1]);
    var lat = wgs84[1].toFixed(6),
        lng = wgs84[0].toFixed(6);
    var wid = Math.ceil((lng - L) * Nw / (R - L)),
        hid = Math.ceil((T - lat) * Nh / (T - B));
    console.log([lat, lng])
    $("#wgs84_coordinates").val([lat, lng]);
    $("#grid_number").val([hid, wid]);

};

// UTILITIES ========================================================
// string formatter
String.prototype.format = function () {
    var pattern = /\{\d+\}/g;
    var args = arguments;
    return this.replace(pattern, function (capture) {
        return args[capture.match(/\d+/)];
    });
};

// guid generator
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}