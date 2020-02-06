/**
 * @name Log
 * @service
 * @description Handles all logging operations.
 */

const moment = require('moment-timezone');

module.exports = {

	/**
	 * @name Log
	 * @function
	 * @description Log info to stdout, which will be picked up
	 * by AWS CloudWatch.
	 * @param {object} incomingObject
	 */

	Log: (incomingObject) => {
		// construct a datetime string
		const datetimeString = moment().tz('America/New_York')
			.format('dddd, MMMM D YYYY, h:mm a');
		// log datetime
		// eslint-disable-next-line no-console
		console.log(` ----- ${datetimeString}`);
		// for each object property key
		Object.keys(incomingObject).forEach((key) => {
			// log the key and the property value
			// eslint-disable-next-line no-console
			console.log(` ----- ${key} -- `, incomingObject[key]);
		});
	},
	
};
