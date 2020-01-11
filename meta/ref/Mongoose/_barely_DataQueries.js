/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
/**
 * @name DataQueries
 * @service
 * @description Service facilitating all data queries from Lambda functions to MongoDB Atlas,
 */

const { MongoClient } = require('mongodb');

let mongoDbUri;
const cachedDb = null;

module.exports.InsertDocIntoCollection = (database, doc, collection, context) =>
	// return a new promise
	new Promise((resolve, reject) => {
		// get db connection

		if (!mongoDbUri) {
			mongoDbUri = process.env.mongoDbUriDev;
		}
		console.log('mongoDbUri');
		console.log(mongoDbUri);
		console.log('');
		// keep the db connection warm for reuse
		/* context.callbackWaitsForEmptyEventLoop = false; */
		try {
			// Database Name
			const dbName = 'Travel';

			// Use connect method to connect to the server
			MongoClient.connect(mongoDbUri, (err, client) => {
				if (!err) {
					console.log('Connected successfully to server');

					const db = client.db(dbName);
					console.log('Reading this db name');
					console.log(db);
					resolve({
						statusCode: 200,
						body: JSON.stringify({
							data: 'This is some returned data.',
						}),
					});
					client.close();
				} else {
					console.log('Could not connect!');
					reject(JSON.stringify(err));
				}
			});


			/* console.log('cached db');
			console.log(cachedDb);
			if (!cachedDb) {
				console.log('--- no cached db');
				const client = new MongoClient(mongoDbUri, {
					useNewUrlParser: true,
				});
				console.log('--- this is new client');
				console.log(client);
				client.connect((error) => {
					console.log('--- got into connect');
					// const db = client.db('Travel');
					cachedDb = client.db('Travel');
					// const collection = client.db('Travel').collection('devices');
				});
				
				// MongoClient.connect(mongoDbUri, (err, client) => {
				// 	console.log('DB CXN RESULT');
				// 	if (err) {
				// 		console.log('ERROR');
				// 		console.log(err);
				// 	} else {
				// 		console.log('SUCCESS');
				// 		console.log(client);
				// 	}
				// 	cachedDb = client.db('Travel');
				// });
			}
			
			// createDoc(cachedDb, jsonContents, callback);
			if (cachedDb) {
				cachedDb.collection('restaurants').insertOne(doc, (err, result) => {
					if (err != null) {
						console.error('INSERT ERROR 1');
						console.log(err);
						console.log('');
						reject(JSON.stringify(err));
					} else {
						console.log('INSERT SUCCESS');
						console.log(result.insertedId);
						console.log('');
						resolve({
							statusCode: 200,
							body: JSON.stringify({
								data: 'This is some returned data.',
							}),
						});
					}
				});
			} else {
				reject('No DB Connection');
			} */
		} catch (err) {
			console.error('INSERT ERROR 2');
			console.log(err);
			console.log('');
			reject(JSON.stringify(err));
		}
	});
