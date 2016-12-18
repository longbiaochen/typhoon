var assert = require('assert');
var mongodb = require('mongodb');

var damage = {};
var collection;

// API FUNCTIONSS
damage.init = function () {
    // Connection URL
    var url = "mongodb://localhost:27017/road";
    mongodb.MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        collection = db.collection('damage');
        console.log("Connected correctly to mongodb.");
    });

}

damage.query = function (request, response) {
    collection.find().toArray(function (err, docs) {
        response.send(docs);
    });
};

damage.report = function (request, response) {
    console.log(request.body);

    collection.find({
        "damage_id": request.body.item.damage_id
    }).toArray(function (err, docs) {
        if (docs.length == 0) {
            collection.insertMany([request.body.item], function (err, result) {
                console.log("Inserted");
                response.send({
                    status: "SUCCESS"
                });

            });
        }
        else {
            collection.updateOne({
                "damage_id": request.body.item.damage_id
            }, {
                $set: request.body.item
            }, function (err, result) {
                console.log("Updated");
                response.send({
                    status: "SUCCESS"
                });
            });
        }
    });
}

damage.delete = function (request, response) {
    console.log(request.body.damage_id);
    collection.deleteOne({
        "damage_id": request.body.damage_id
    }, function (err, result) {
        console.log("Removed");
        response.send({
            status: "SUCCESS"
        });
    });
}

module.exports = damage;

// UTILITIES
String.prototype.format = function () {
    var pattern = /\{\d+\}/g;
    var args = arguments;
    return this.replace(pattern, function (capture) {
        return args[capture.match(/\d+/)];
    });
};