// API FUNCTIONSS
var damage = {};

damage.init = function () {
    
}

damage.query = function (request, response) {
    /*console.log(request.query);
    // TODO
    var data = [{
        coordinates: [118.127532, 24.48469],
        date: "2016-09-15",
        time: "03:00",
        timestamp: "1473879600",
        damage_type: "fallen trees",
        damage_impact: "blocked lane",
        source_url: "http://weibo.com/1750354532/E8nYioiz8",
        damage_id: "abdd4de8-2137-d8ab-702e-8a4773b9b181"
    }, {
        coordinates: [118.120945, 24.43594],
        date: "2016-12-16",
        time: "14:04",
        timestamp: "1481868240",
        damage_type: "puddle",
        damage_impact: "blocked road",
        source_url: "http://weibo.com/1750354532/E8nYioiz8",
        damage_id: "5465c44f-7ef6-d718-929b-ce9d8963fa68"
    }];
    response.send(data);*/
    var MongoClient = require('mongodb').MongoClient
      , assert = require('assert');

    // Connection URL
    var url = 'mongodb://localhost:27017/road';
    // Use connect method to connect to the server
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected correctly to mongodb");

        findDocuments(db, function() {
          db.close();
        });
    });
    var findDocuments = function(db, callback) {
      // Get the documents collection
      var collection = db.collection('damage');
      // Find some documents
      collection.find().toArray(function(err, docs) {
        assert.equal(err, null);
        response.send(docs);
        callback(docs);
      });
    }
}

damage.report = function (request, response) {
    console.log(request.body);
    // TODO
    response.send("duplicated damage id.");
    
    var MongoClient = require('mongodb').MongoClient
      , assert = require('assert');

    // Connection URL
    var url = 'mongodb://localhost:27017/road';
    var flag = 1;
    // Use connect method to connect to the server
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);

        findDocuments(db, function() {
            
            if(flag == 1){
                insertDocuments(db, function(){})
            }
            else{
                updateDocument(db, function(){})
            }
            db.close();
        });
    });
    var findDocuments = function(db, callback) {
      // Get the documents collection
      var collection = db.collection('damage');
      // Find some documents
      collection.find( {"damage_id" : request.body.item.damage_id}).toArray(function(err, docs) {
        if(docs.length == 0){
            flag = 1;
        }
        else{
            flag = 0;
        }
        assert.equal(err, null);  
        callback(docs);
      });
    }
    var insertDocuments = function(db, callback) {
      // Get the documents collection
      var collection = db.collection('damage');
      // Insert some documents
      collection.insertMany([request.body.item], function(err, result) {
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        assert.equal(1, result.ops.length);
        console.log("Inserted");
        callback(result);
      });
    }
    var updateDocument = function(db, callback) {
      // Get the documents collection
      var collection = db.collection('damage');
      // Update document where a is 2, set b equal to 1
      collection.updateOne({ "damage_id" : request.body.item.damage_id }
        , { $set: request.body.item }, function(err, result) {
        assert.equal(err, null);
        //assert.equal(1, result.result.n);
        console.log("Updated");
        callback(result);
      });  
    }
}

damage.delete = function (request, response) {
    console.log(request.body.damage_id);
    // TODO
    /*response.send({
        damage_id: request.body.damage_id
    });*/
    var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

    // Connection URL
    var url = 'mongodb://localhost:27017/road';
    // Use connect method to connect to the server
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);

      removeDocument(db, function() {
        db.close();
      });
    });
      var removeDocument = function(db, callback) {
      // Get the documents collection
      var collection = db.collection('damage');
      // Insert some documents
      collection.deleteOne({ "damage_id" : request.body.damage_id }, function(err, result) {
        assert.equal(err, null);
        //assert.equal(1, result.result.n);
        console.log("Removed");
        callback(result);
      });    
    }
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