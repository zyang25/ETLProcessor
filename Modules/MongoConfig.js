'use strict';
var mongojs = require('mongojs');

class Mongo {

	constructor(mongoInstance, mongoURI) {
		this.dbObj =  mongojs(mongoInstance + '/' + mongoURI);
	}

	get mongoObj(){
		return this.dbObj;
	}
}


module.exports = Mongo;