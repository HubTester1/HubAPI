/**
 * @name People
 * @cron
 * @description Perform all cron jobs to retrieve and process data for People API
 */

// const DataQueries = require('data-queries');
const UltiPro = require('ultipro');

/**
 * @name XXX
 * @function
 * @async
 * @description XXX
 */

exports.AddAllUltiProEmployeesToDatabase = (event, context) =>
	// return a new promise
	new Promise((resolve, reject) => {
		UltiPro.ReturnAllEmployeesFromUltiPro()
			// if the promise is resolved with the result, then resolve this promise with the result
			.then((result) => {
				resolve({
					statusCode: 200,
					body: JSON.stringify(result),
				});
			})
			// if the promise is rejected with an error, then reject this promise with an error
			.catch((error) => {
				reject({
					statusCode: 500,
					body: JSON.stringify(error),
				});
			});
		/* 
			// if the promise is resolved with the result, then resolve this promise with the result
			.then((result) => {
				resolve({
					statusCode: 200,
					body: JSON.stringify(result),
				});
			})
			// if the promise is rejected with an error, then reject this promise with an error
			.catch((error) => {
				reject({
					statusCode: 500,
					body: JSON.stringify(error),
				});
			});


		// get a promise to retrieve all documents from the emailQueue document collection
		DataQueries.InsertDocIntoCollection(kitten, '_Kittens')
			// if the promise is resolved with the result, then resolve this promise with the result
			.then((result) => {
				resolve({
					statusCode: 200,
					body: JSON.stringify(result),
				});
			})
			// if the promise is rejected with an error, then reject this promise with an error
			.catch((error) => {
				reject({
					statusCode: 500,
					body: JSON.stringify(error),
				});
			});

		
		*/
	});
