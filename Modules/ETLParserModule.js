'use strict';
var fs = require('fs');
const Mongo = require('./MongoConfig.js');

class ETLParser {

	constructor(dbInstance) {

		this.etlRoot = 'D:/UPSData/pfs/fdc/log/';
		this.dbInstance = dbInstance;
	}

	TruncateData(serverIP, etlName) {

		var dbCollection = this.dbInstance.collection(serverIP);

		try {
			dbCollection.remove({ "parent": etlName });

		} catch (e) {
			console.log(e);
		}
	}

	UploadData(serverIP, etlName) {

		try {

			// DB Collection instance
			var dbCollection = this.dbInstance.collection(serverIP);

			// DB object
			var bulk = dbCollection.initializeOrderedBulkOp();

			//Abs path
			var etlPath = this.etlRoot + etlName;

			// Check if file exist
			if (!fs.existsSync(etlPath))
				return false;

			// Async reading file
			fs.readFile(etlPath, 'utf8', function (err, data) {

				if (err) throw err;

				// Parent doc for querying
				var parentDoc = etlName;

				var lines = data.split('*!TOKEN!*');
				var counter = 0;

				lines.forEach(function (element) {
					var timestamp = element.substring(0, 25);

					bulk.insert({
						'parent': parentDoc,
						'timestamp': timestamp,
						'trace': element
					})
					counter++;

					if (counter % 10 == 0 || counter == lines.length - 1) {
						console.log("Uploading - " + counter + " - Total - " + lines.length)
						//console.log(bulk);
						bulk.execute(function (err, res) {
							//if(err != "") console.log(err)
						})

						// INIT bulk object
						bulk = dbCollection.initializeOrderedBulkOp();
					}
				});
				console.log('Done' + Date.now());
			});

		} catch (err) {
			console.log(err);
		}

	}

	UploadOperation(serverIP, etlName) {
		console.log('Start' + Date.now());
		this.TruncateData(serverIP, etlName);
		this.UploadData(serverIP, etlName);
		console.log('End' + Date.now());
	}

}

let mongo = new Mongo('10.245.215.101:27017', 'ServerBaseETLData');
console.log(mongo.mongoObj);

let etlParser = new ETLParser(mongo.mongoObj);

//EDWorkflowTrace.etl.txt
//etlParser.UploadOperation('10.245.216.194', 'HINWorkflow.etl.txt');
//etlParser.UploadOperation('10.245.216.194', 'EDWorkflowTrace.etl.txt');


module.exports = ETLParser;

//etlParser.TruncateData('localhost', 'HINWorkflow.etl.txt');
//etlParser.UploadData('localhost', 'HINWorkflow.etl.txt');




































//UploadProcess('localhost', 'HINWorkflow.etl.txt', dbInstance);

// Workflow
function UploadProcess(serverIP, fileName, dbObj) {

	// Delete the doc before insert
	DBOperationRemoveDocByNode(serverIP, fileName, dbObj);

	// Parse the doc to MongoD
	DBOperationParseETLToMongoD(serverIP, fileName, dbObj);

	//Query count
	//DBOperationFindDoc(serverIP, fileName, dbObj);
}



//ETLParser('UDCGIOService.etl.txt', db)
//ETLParser('UDCGIOService.etl.txt', db)

// Remove doc by node
//RemoveDocByNode('localhost', 'UDCGIOService.etl.txt', dbInstance);
//DBOperationFindDoc('localhost', 'HINWorkflow.etl.txt', dbInstance);


//ParseETLToMongoD('localhost', 'UDCGIOService.etl.txt', dbInstance);

//DBOperationGetCount('localhost', 'UDCGIOService.etl.txt', dbInstance);


//ParseETLToMongoD('localhost', 'UDCGIOService.etl.txt', dbInstance)


function DBOperationParseETLToMongoD(serverIP, fileName, dbObj) {

	try {

		// DB Collection instance
		var dbCollection = dbObj.collection(serverIP);

		// DB object
		var bulk = dbCollection.initializeOrderedBulkOp();

		//Abs path
		var etlPath = etlRoot + fileName;

		// Check if file exist
		if (!fs.existsSync(etlPath))
			return false;

		// Async reading file
		fs.readFile(etlPath, 'utf8', function (err, data) {

			if (err) throw err;

			// Parent doc for querying
			var parentDoc = fileName;

			var lines = data.split('*!TOKEN!*');
			var counter = 0;

			lines.forEach(function (element) {
				var timestamp = element.substring(0, 25);

				bulk.insert({
					'parent': parentDoc,
					'timestamp': timestamp,
					'trace': element
				})
				counter++;

				if (counter % 10 == 0 || counter == lines.length - 1) {
					console.log("Uploading - " + counter + " - Total - " + lines.length)
					//console.log(bulk);
					bulk.execute(function (err, res) {
						//if(err != "") console.log(err)
					})

					// INIT bulk object
					bulk = dbCollection.initializeOrderedBulkOp();
				}
			});
			console.log('Done' + Date.now());
		});

	} catch (err) {
		console.log(err);
	}
}

function ParseETLToMongoDInReverseOrder(serverIP, fileName, dbObj) {

	try {

		// DB Collection instance
		var dbCollection = dbObj.collection(serverIP);

		// DB object
		var bulk = dbCollection.initializeOrderedBulkOp();

		//Abs path
		etlPath = etlRoot + fileName;

		// Check if file exist
		if (!fs.existsSync(etlPath))
			return false;

		// Async reading file
		fs.readFile(etlPath, 'utf8', function (err, data) {

			if (err) throw err;

			// Parent doc for querying
			var parentDoc = fileName;

			var lines = data.split('*!TOKEN!*');
			var counter = 0;

			for (var i = lines.length - 1; i >= 0; i--) {

				var element = lines[i];

				var timestamp = element.substring(0, 25);

				bulk.insert({
					'parent': parentDoc,
					'timestamp': timestamp,
					'trace': element
				})
				counter++;

				if (counter % 10 == 0 || counter == lines.length - 1) {
					console.log("Uploading - " + counter + " - Total - " + lines.length)
					//console.log(bulk);
					bulk.execute(function (err, res) {
						//if(err != "") console.log(err)
					})

					// INIT bulk object
					bulk = dbCollection.initializeOrderedBulkOp();
				}
			}



			console.log('Done' + Date.now());
		});

	} catch (err) {
		console.log(err);
	}
}

function DBOperationRemoveDocByNode(serverIP, etlFileNa, dbObj) {
	// DB Collection instance
	var dbCollection = dbObj.collection(serverIP);

	try {
		dbCollection.remove({ "parent": etlFileNa });

	} catch (e) {
		console.log(e);
	}
}

function DBOperationGetCount(serverIP, etlFileNa, dbObj) {
	// DB Collection instance
	var dbCollection = dbObj.collection(serverIP);
	console.log(etlFileNa);
	try {
		dbCollection.find({ "parent": etlFileNa }, function (err, docs) {
			console.log(docs.length);
		})
	} catch (e) {
		console.log(e);
	}
}

function DBOperationFindDoc(serverIP, etlFileNa, dbObj) {
	// DB Collection instance
	var dbCollection = dbObj.collection(serverIP);
	console.log(etlFileNa);
	try {

		console.log('Query start' + Date.now());
		dbCollection.find({ "parent": etlFileNa }, function (err, docs) {
			console.log(docs.length);
			console.log('Query end' + Date.now());
		});


	} catch (e) {
		console.log(e);
	}
}

console.log("Done");