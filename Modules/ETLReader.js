'use strict';
const Mongo = require('./MongoConfig.js');

class ETLReader {

    constructor() {
        this.mongdbObj = (new Mongo('10.245.215.101:27017', 'ServerBaseETLData')).mongoObj;
    }

    getETL(collectionName, etlName, callback) {

        var dbCollection = this.mongdbObj.collection(collectionName);
        console.log(dbCollection);

        dbCollection.find({ parent: etlName }, function (err, docs) {
            //return call back reference
            return callback(docs);
        });
    }

}


// let etlReader = new ETLReader();
// console.log(etlReader);
// etlReader.getETL("10.245.216.194", "HINWorkflow.etl.txt", function (res) {
//     console.log(res);
// });

module.exports = ETLReader;