var express = require('express')
var app = express();
var http = require('http');
var path = require('path');
const bodyParser = require('body-parser')
var mongojs = require('mongojs')
var AppDevConnection = mongojs('mongodb://svrt0000031a.tus.ams1907.com:27017/ETWTool', ['LabInfo', 'OPSVInfo']);
var DBInstance_ServerBaseETLData = mongojs('mongodb://svrt0000031a.tus.ams1907.com:27017/ServerBaseETLData');
var request = require("request");

// Modules
const ETLReader = require('./Modules/ETLReader.js');


AppDevConnection.on('error', function (err) {
	if (err) return console.log('database error', err);
})


DBInstance_ServerBaseETLData.on('error', function (err) {
	if (err) return console.log('ServerBaseETLData instance connection error', err);
})

AppDevConnection.on('connect', function () {
	console.log('database connected')
})

// MongoDB data
app.set('views', path.join(__dirname, ''))
app.use('/public', express.static('public'))
app.use('/etl', express.static('app'))

// Body parser
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({
	extended: true
}));



// app.get('/', function(req, res) {
//     res.sendFile("/views");
// });

// Entry point for lab information
app.post('/data/LabInfo', function (req, res) {
	AppDevConnection.LabInfo.find({}, function (error, result) {
		res.send(result);
		res.end();
	})
})

// Entry point for OPSV lab information
app.post('/data/OPSVInfo', function (req, res) {
	AppDevConnection.OPSVInfo.find({}, function (error, result) {
		res.send(result);
		res.end();
	})
})

// Entry point for events list
app.get('/data/ETLEvents', function (req, res) {

	var domainNameFromReq = req.body;

	var options = {
		method: 'POST',
		url: 'http://10.245.215.101:8888/UDCDataSupport/GetETLLatestEvents',
		headers:
		{
			'cache-control': 'no-cache',
			'content-type': 'application/json'
		},
		body:
		{
			serverIP: '10.245.216.194',
			fileName: 'UDCKeyEntryWorkflowTrace.etl',
			counts: '120',
			mbSize: '25'
		},
		json: true
	};

	request(options, function (error, response, body) {
		if (error) throw new Error(error);
		res.send(response);
	});

})

// Entry point for file list
app.post('/data/FileList', function (req, res) {

	var domainNameFromReq = req.body.serverName;


	var options = {
		method: 'POST',
		url: 'http://10.245.215.101:8888/UDCDataSupport/FileNameInPath',
		headers:
		{
			'cache-control': 'no-cache',
			'content-type': 'application/json'
		},
		body: { path: '\\\\10.245.216.194\\\\UPSData\\\\PFS\\\\FDC\\\\log\\\\' },
		json: true
	};

	request(options, function (error, response, body) {
		if (error) throw new Error(error);
		res.send(response);
	});
})


// Entry point for ProcessETL
app.post('/data/ProcessETL', function (req, res) {

	var options = {
		method: 'POST',
		url: 'http://10.245.215.101:8888/UDCDataSupport/ProcessETLController',
		headers:
		{
			'cache-control': 'no-cache',
			'content-type': 'application/json'
		},
		body: { serverIP: '10.245.216.194', fileName: 'UDCGIOService.etl' },
		json: true
	};

	request(options, function (error, response, body) {
		if (error) throw new Error(error);

		res.send(response);
	});

})

// Entry point for Processed ETL data
app.post('/data/ProcessedETLData', function (req, res) {


	var options = {
		method: 'POST',
		url: 'http://10.245.215.101:8888/UDCDataSupport/GetETLLatestEvents',
		headers:
		{
			'cache-control': 'no-cache',
			'content-type': 'application/json'
		},
		body:
		{
			serverIP: '10.245.216.194',
			fileName: 'UDCGIOService.etl',
			mbSize: '25',
			counts: '100'
		},
		json: true
	};

	request(options, function (error, response, body) {
		if (error) throw new Error(error);

		res.send(response);
	});


})

// Query MongoDB
app.post('/data/QueryEventsFromMongo', function (req, res) {

	console.log(req.body.etlName);

	var queryParam = req.body.etlName;

	try {

		var dbColl = DBInstance_ServerBaseETLData.collection(queryParam);

		console.log('Query start' + Date.now());
		dbColl.find({}, function (err, docs) {
			//console.log( docs.length);
			console.log('Query end' + Date.now());

			res.send(docs);
			res.end();
		});


	} catch (e) {
		console.log(e);
	}


})


app.post('/data/readETL', function (req, res) {
console.log("readETLisRunning")
	let etlReader = new ETLReader();
	console.log(etlReader);
	etlReader.getETL("10.245.216.194", "HINWorkflow.etl.txt", function (res) {
		console.log(res);
		res.send(docs);
		res.end();
	});

	// console.log(req.body.etlName);

	// var queryParam = req.body.etlName;

	// try {

	// 	var dbColl = DBInstance_ServerBaseETLData.collection(queryParam);

	// 	console.log('Query start' + Date.now());
	// 	dbColl.find({}, function (err, docs) {
	// 		//console.log( docs.length);
	// 		console.log('Query end' + Date.now());

	// 		res.send(docs);
	// 		res.end();
	// 	});


	// } catch (e) {
	// 	console.log(e);
	// }


})



app.listen(5566, function (error, result) {
	console.log('Server is listening on 5566')
})

