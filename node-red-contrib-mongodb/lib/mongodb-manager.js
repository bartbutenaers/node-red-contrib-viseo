'use strict';
const DatabaseManager = require('node-red-viseo-nosql-manager').DbManager;
const MongoClient   = require('mongodb').MongoClient;


class MongoDBManager extends DatabaseManager {

    constructor(node) {
        super();
        this.db = null;
        this._init(node);
    }

    get key() {
        return this.host + '_' + this.database;
    }

    get database() {
    	return _database;
    }

    static get definition() {
        return {
            name : "MongoDB",
            qName : "mongodb"
        };
    }

    getStatus(config) {
    	let error = '';
        if(!this.host) {
            error = 'Missing host for MongoDB server';
        } else if(!this.port) {
            error = 'Missing port for Mongo server';
        } else if(!this._database) {
            error = 'Missing database name for Mongo connection';
        } else if(config && !config.collection) {
            error = 'Missing collection name for Mongo request';
        } else if(!this.user) {
            error = 'Missing user name for Mongo connection';
        } else if(!this.password) {
            error = 'Missing password for Mongo connection';
        }

        return error;
    }

    _init(node) {

        this.host = node.credentials.host;
        this.port = node.credentials.port;
        this._database = node.database;
        this.user = node.credentials.user;
        this.password = node.credentials.password;


		if(this.db === null && this.getStatus() === '') {

            this.url =  'mongodb://'+node.credentials.user+':'+encodeURIComponent(node.credentials.password)
                    +'@'+node.credentials.host+':'+node.credentials.port+'/'+node.database;
            let manager = this;

                //CONNECT DATABASE
            MongoClient.connect(this.url, function(err, db) {

                if(err === null) {
                    manager.db = db;
                    info("Connected to database "+manager.url);
                } else {
                    error(err);
                    node.warn("Could not connect to database "+manager.url);
                }
            });
        }
    }

    end(callback) {
    	
    	if(this.db !== null) {

	        this.db.close();
	    	this.db = null;
	        info('mongoDB connection to '+this.url+' stopped.');
	 
    	}
    	callback();
    }

    find(key, data, config, callback) { 

	    let collection = this.db.collection(config.collection);
	    collection.find(key).toArray(function(err, documents) {
	    	callback(err, data, documents);
	    });
	}

	update(key, value, data, config, callback) {

		let collection = this.db.collection(config.collection);
	    collection.updateOne(key, { $set: value }, { upsert: true }, function(err, result) {
	        callback(err, data, result);
	    });
	}

	add(values, data, config, callback) {

	    let collection = db.collection(config.collection);
	    collection.insertMany(values, function(err, result) {
	    	callback(err, data, result);
	    });

	}

	remove(key, data, config, callback) {

	    let collection = db.collection(config.collection);
	    collection.deleteOne(key, function(err, result) {
	        callback(err, data, result);
	    });    

	}
};

module.exports = MongoDBManager;
