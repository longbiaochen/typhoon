// @author: longbiaochen@icloud.com
var CENTER = 118.13239350000003,
    MIDDLE = 24.49167882244474;
var SIZE = 800;
var START_TIME = 1473868800;
var DAMAGE_DATA = [];
var MAP;

// ENTRY =========================================================
$(function () {
    init_map();

    // UI listeners ----------------------------------------------
    $("#source_url_checker").on("click", function () {
        var url = $("#source_url").val();
        window.open(url, '_blank');
    });

    $("#new_button").on("click", function () {
        $(".damage-field").each(function (id, field) {
            $(field).val("");
            $("#damage_id").val(guid());
        });
    });

    $("#report_button").on("click", function () {
        var item = {};
        $(".damage-field").each(function (id, field) {
            item[field.id] = $(field).val();
        });
        console.log(item);
        $.post("/api/damage/report", {
            item: item
        }, function (response) {
            switch (response) {
            case "SUCCESS":
                $("#success_alert").html("Report success.").slideDown();
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
            alert(response.damage_id);
            $(".damage-field").each(function (id, field) {
                $(field).val("");
            });
        });

    });

});

// FUNCTIONS =====================================================
function init_map() {
    MAP = new BMap.Map("map_view");
    var point = new BMap.Point(CENTER, MIDDLE);
    MAP.centerAndZoom(point, 13);

    load_damage_data();
}

function load_damage_data() {
    $.get("/api/damage/query", function (response) {
        DAMAGE_DATA = response;
        $.each(DAMAGE_DATA, function (index, value) {
            var x = Number(value.coordinates.split(',')[0]);
            var y = Number(value.coordinates.split(',')[1]);
            var point = new BMap.Point(x, y);
            var marker = new BMap.Marker(point);
            marker.addEventListener("click", function () {
                show_damage_info(index);
            });
            MAP.addOverlay(marker);
        });

        //test
        show_damage_info(1);
    });
}

function show_damage_info(index) {
    var item = DAMAGE_DATA[index];
    $.each(item, function (id, val) {
        $("#" + id).val(val);
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