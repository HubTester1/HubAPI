/**
 * @name Cron
 * @service
 * @description Handles all cron meta-operations. 
 * Cron jobs are not performed or scheduled here.
 */

const DataQueries = require('data-queries');
const Utilities = require('utilities');

module.exports = {
	
	/**
	 * @name ReturnEmailQueueData
	 * @function
	 * @async
	 * @description Return all emails from the email queue 
	 * (all docs from the 'emailQueue' collection).
	 */

	Log: (doc) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// preserve function parameter
			const docCopy = Utilities.ReturnCopyOfObject(doc);
			// add a datetime to docCopy
			docCopy.datetime = Utilities.ReturnFormattedDateTime({
				incomingDateTimeString: 'nowLocal',
				incomingFormat: null,
				incomingReturnFormat: null,
				determineYearDisplayDynamically: 0,
			});
			// get a promise to insert
			DataQueries.InsertDocIntoCollection(docCopy, 'cronLog')
				// if the promise is resolved with the result
				.then((result) => {
					// resolve this promise with the result
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with an error
					reject(error);
				});
		}),

};
