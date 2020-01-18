/**
 * @name Kitten
 * @api
 * @description Just a sample / testing API
 */

const DataQueries = require('data-queries');

/**
 * @name InsertKitten
 * @function
 * @async
 * @description This is the kitten insertion function in the Kitten API.
 */

exports.InsertKitten = (event, context) =>
	// return a new promise
	new Promise((resolve, reject) => {
		const kitten = {
			name: 'Olaf',
		};
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
	});
