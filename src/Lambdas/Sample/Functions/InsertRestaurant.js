/**
 * @name InsertRestaurant
 * @function
 * @api Sample
 * @description This is the restaurant insertion function in the Sample API.
*/

var MongoClient = require('mongodb').MongoClient;

let atlas_connection_uri;
let cachedDb = null;

exports.InsertRestaurant = (event, context, callback) => {
	var uri = process.env['mongoDbUriDev'];
	if (atlas_connection_uri != null) {
		processEvent(event, context, callback);
	} else {
		atlas_connection_uri = uri;
		console.log('the Atlas connection string is ' + atlas_connection_uri);
		console.log('');
		processEvent(event, context, callback);
	}
};


const processEvent = (event, context, callback) => {
	console.log('Calling MongoDB Atlas from AWS Lambda with event: ' + JSON.stringify(event));
	console.log('');
	var jsonContents = // JSON.parse(JSON.stringify(event));
		{
			"address": {
				"street": "2 Avenue",
				"zipcode": "10075",
				"building": "1480",
				"coord": [-73.9557413, 40.7720266]
			},
			"borough": "Manhattan",
			"cuisine": "Italian",
			"grades": [{
					"date": "2014-10-01T00:00:00Z",
					"grade": "A",
					"score": 11
				},
				{
					"date": "2014-01-16T00:00:00Z",
					"grade": "B",
					"score": 17
				}
			],
			"name": "Vella",
			"restaurant_id": "41704620"
		};

	//date conversion for grades array
	if (jsonContents.grades != null) {
		for (var i = 0, len = jsonContents.grades.length; i < len; i++) {
			//use the following line if you want to preserve the original dates
			//jsonContents.grades[i].date = new Date(jsonContents.grades[i].date);

			//the following line assigns the current date so we can more easily differentiate between similar records
			jsonContents.grades[i].date = new Date();
		}
	}

	//the following line is critical for performance reasons to allow re-use of database connections across calls to this Lambda function and avoid closing the database connection. The first call to this lambda function takes about 5 seconds to complete, while subsequent, close calls will only take a few hundred milliseconds.
	context.callbackWaitsForEmptyEventLoop = false;

	try {
		if (cachedDb == null) {
			console.log('=> connecting to database');
			console.log('');
			MongoClient.connect(atlas_connection_uri, function (err, client) {
				cachedDb = client.db('Travel');
				return createDoc(cachedDb, jsonContents, callback);
			});
		} else {
			createDoc(cachedDb, jsonContents, callback);
		}
	} catch (err) {
		console.error('an error occurred', err);
		console.log('');
	}
}

const createDoc = (db, json, callback) => {
	db.collection('restaurants').insertOne(json, function (err, result) {
		if (err != null) {
			console.error("an error occurred in createDoc", err);
			console.log('');
			callback(null, JSON.stringify(err));
		} else {
			console.log("Kudos! You just created an entry into the restaurants collection with id: " + result.insertedId);
			console.log('');
			callback(null, {
				// "isBase64Encoded": true | false,
				statusCode: 200,
				body: JSON.stringify({ data: 'This is some returned data.'})
			});
		}
		//we don't need to close the connection thanks to context.callbackWaitsForEmptyEventLoop = false (above)
		//this will let our function re-use the connection on the next called (if it can re-use the same Lambda container)
		//db.close();
	});
};