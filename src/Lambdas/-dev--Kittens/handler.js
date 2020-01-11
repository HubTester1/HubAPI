/**
 * @name InsertKitten
 * @function
 * @api Sample
 * @description This is the kitten insertion function in the Kitten API. 
 * Of course, this is just a sample / testing API.
 */

const DataQueries = require('../../Services/DataQueries');

exports.InsertKitten = (event, context, callback) => {
	const kitten = {
		name: 'Olaf',
	};
	// get a promise to retrieve all documents from the emailQueue document collection
	DataQueries.InsertDocIntoCollection(kitten, '_Kittens')
	// if the promise is resolved with the result, then resolve this promise with the result
		.then((result) => {
			callback(null, result);
		})
	// if the promise is rejected with an error, then reject this promise with an error
		.catch((error) => {
			callback(null, error);
		});
};
