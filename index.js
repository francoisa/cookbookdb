(function(){
    var assign = Object.assign || require('object.assign');
    var mongoClient = require('mongodb').MongoClient;
    var ObjectId = require('mongodb').ObjectID;
    var dbhost = 'mongodb://localhost:27017/test';
    var table = 'cookbook';
    var Cookbook = function() {
            this._recipes = [];
    }; 
    Cookbook.prototype = assign(Object.create(Object.prototype), {
        constructor: Cookbook,
        getRecipes: function(callback) {
            var recipes = [];
            mongoClient.connect(dbhost, function(err, db) {
                var cookbook = db.collection(table);
                cookbook.find().toArray(function(err, docs) {
                    docs.forEach(function(recipe) { recipes.push(recipe); });
                    db.close();
                    callback(null, recipes);
                });
            });
        },
        getRecipe: function(id, callback) {
            mongoClient.connect(dbhost, function(err, db) {
                var cookbook = db.collection(table);
                cookbook.findOne({_id: ObjectId(id)}, function(err, doc) {
                    db.close();
                    callback(null, doc);
                });
            });
            
        },
        saveRecipe: function(recipe, callback) {
            mongoClient.connect(dbhost, function(err, db) {
                var cookbook = db.collection(table);
                if (recipe._id) {
                    err = new Error('the recipe has an id: ' + JSON.stringify(recipe._id));
                    callback(err);
                }
                else {
                    db.collection(table).findOne({name: recipe.name}, function(err, doc) {
                        if (doc) {
                            err = new Error('recipe "' + recipe.name + '" already exists.');
                            db.close();
                            callback(err);
                        }
                        else {
                            cookbook.insert(recipe, function(err, docs) {
                                db.close();
                                callback(err);
                            });                            
                        }
                    });
                }
            });
        },        
        updateRecipe: function(recipe, callback) {
            mongoClient.connect(dbhost, function(err, db) {
                var cookbook = db.collection(table);
                var id = recipe.id;
                delete recipe.id;
                cookbook.update({_id: id}, {$set: recipe}, {w:1}, function(err, docs) { 
                    db.close();
                    callback(err);
                });
            });
        },
        deleteRecipe: function(id, callback) {
            mongoClient.connect(dbhost, function(err, db) {
                var cookbook = db.collection(table);
                cookbook.remove({_id: id}, {w:1}, function(err, result) {
                    db.close();
                    callback(err);
                });
            });
        }
    });
    
    module.exports = new Cookbook();
    exports = module.exports;
}).call(this);
