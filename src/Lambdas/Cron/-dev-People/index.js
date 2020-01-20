/**
 * @name People
 * @cron
 * @description Perform all cron jobs to retrieve and process data for People API
 */

const DataQueries = require('data-queries');
const UltiPro = require('ultipro');
const MSGraph = require('ms-graph');
/**
 * @name AddAllUltiProEmployeesToDatabase
 * @function
 * @async
 * @description Get all employees via UltiPro service. Insert into peopleUltiProRaw collection.
 */

exports.AddAllUltiProEmployeesToDatabase = (event, context) =>
	// return a new promise
	new Promise((resolve, reject) => {
		UltiPro.ReturnAllEmployeesFromUltiPro()
			// if the promise is resolved with the result, then resolve this promise with the result
			.then((queryResult) => {
				// get a promise to retrieve all documents from the emailQueue document collection
				DataQueries.InsertDocIntoCollection(queryResult.allEmployees, 'peopleRawUltiPro')
					// if the promise is resolved with the result, then resolve this promise with the result
					.then((insertResult) => {
						resolve({
							statusCode: 200,
							body: JSON.stringify(insertResult),
						});
					})
					// if the promise is rejected with an error, then reject this promise with an error
					.catch((error) => {
						reject({
							statusCode: 500,
							body: JSON.stringify(error),
						});
					});
			})
			// if the promise is rejected with an error, then reject this promise with an error
			.catch((error) => {
				reject({
					statusCode: 500,
					body: JSON.stringify(error),
				});
			});
	});

exports.AddAllMSGraphUsersToDatabase = (event, context) =>
	// return a new promise
	new Promise((resolve, reject) => {
		MSGraph.ReturnDataFromGraph('users')
			// if the promise is resolved with the result, then resolve this promise with the result
			.then((queryResult) => {
				// get a promise to retrieve all documents from the emailQueue document collection
				DataQueries.InsertDocIntoCollection(queryResult.data, 'peopleRawMSGraphUsers')
					// if the promise is resolved with the result, then resolve this promise with the result
					.then((insertResult) => {
						resolve({
							statusCode: 200,
							body: JSON.stringify(insertResult),
						});
					})
					// if the promise is rejected with an error, then reject this promise with an error
					.catch((insertError) => {
						reject({
							statusCode: 500,
							body: JSON.stringify(insertError),
						});
					});
			})
			// if the promise is rejected with an error, then reject this promise with an error
			.catch((error) => {
				reject({
					statusCode: 500,
					body: JSON.stringify(error),
				});
			});
	});
