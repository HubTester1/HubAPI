/**
 * @name Utilities
 * @service
 * @description Miscellaneous utility functions
 */

const moment = require('moment');
const atob = require('atob');

module.exports = {

	/**
	 * @name ReturnAnyValueAsUniqueObject
	 * @function
	 * @description Return a new object. If given a parsable 
	 * string representation of an object, return a parsed 
	 * object. If given an object, return a copy of the 
	 * object. Otherwise, return an empty object.
	 * @param {any} incomingValue - e.g., 'kjsdf89gsdnrejk'
	 */

	ReturnUniqueObjectGivenAnyValue: (incomingValue) => {
		// set up return value, defaulting to an empty object
		let returnValue = {};
		// if incomingValue is a parsable string representation 
		// 		of an object
		if (
			module.exports
				.ReturnValueIsJSONParsableString(incomingValue)
		) {
			// parse it into a new object
			returnValue = JSON.parse(incomingValue);
		// if incomingValue is a non-array object
		} else if (
			typeof (incomingValue) === 'object' && 
			!incomingValue[0]
		) {
			// get a copy thereof
			returnValue = 
				module.exports.ReturnCopyOfObject(incomingValue);
		}
		// return returnValue
		return returnValue;
	},

	/**
	 * @name ReturnValueIsJSONParsableString
	 * @function
	 * @description Return true if incomingValue is a JSON-parsable 
	 * string. Otherwise, return false.
	 * @param {any} incomingValue - e.g., '{ kjsdf89: "gsdnrejk" }'
	 */

	ReturnValueIsJSONParsableString: (incomingValue) => {
		// set up return value, defaulting to false
		let returnValue = false;
		// try...
		try {
			// ...to get a parsed object
			const attemptedObject = JSON.parse(incomingValue);
			// Parsing a boolean or a number will not throw an error,
			// 		so we must check that type is object. However, 
			// 		null is also of type object, so we must also 
			// 		test for truthiness.
			// if type is object and value is truthy
			if (attemptedObject && typeof attemptedObject === 'object') {
				// indicate that string is parsable
				returnValue = true;
			// if either type is not object or value is not truthy
			} else {
				// indicate that string is not parsable
				returnValue = false;
			}
			
		// if attempt to get an object resulted in an error
		} catch (e) {
			// indicate that string is not parsable
			returnValue = false;
		}
		// return returnValue
		return returnValue;
	},

	/**
	 * @name ReturnJWTPayload
	 * @function
	 * @description Return the payload portion of a JSON Web Token.
	 * @param {string} incomingString - e.g., 'kjsdf89gsdnrejk'
	 */

	ReturnJWTPayload: (incomingString) =>
		JSON.parse(
			module.exports.ReturnBase64DecodedUnicodeString(
				incomingString
					.split('.')[1]
					.replace('-', '+').replace('_', '/'),
			),
		),

	/**
	 * @name ReturnBase64DecodedUnicodeString
	 * @function
	 * @description Return a decoded base-64 encoded string that may
	 * be in Unicode format.
	 * @param {string} incomingString - e.g., 'kjsdf89gsdnrejk'
	 */

	ReturnBase64DecodedUnicodeString: (incomingString) =>
		decodeURIComponent(
			Array.prototype.map.call(atob(incomingString), (c) =>
				`%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join(''),
		),

	/**
	 * @name ReturnAccountFromUserAndDomain
	 * @function
	 * @description Return substring preceding '@' character.
	 * @param {string} incomingString - e.g., 'sp1@mos.org'
	 */

	ReturnAccountFromUserAndDomain: (incomingString) => incomingString.substring(0, incomingString.search('@')).trim(),

	/**
	 * @name ReturnTerseEmailAddressFromFriendly
	 * @function
	 * @description Return the actual address portion from a friendly-formatted
	 * address. E.g., return 'noreply@mos.org'.
	 * @param {string} incomingString - e.g., 'The Hub <noreply@mos.org>'
	 */

	ReturnTerseEmailAddressFromFriendly: (incomingString) => {
		// determine positions of new line characters
		const positionOfOpeningBracket = incomingString.search('<');
		// set up string to return
		let stringToReturn;
		// if an opening bracket was found
		if (positionOfOpeningBracket !== -1) {
			// set the string to return to the portion after the opening 
			// 		bracket, minus the closing bracket last character
			stringToReturn =
				incomingString.substring(
					positionOfOpeningBracket + 1,
					incomingString.length - 1,
				);
		// if NO opening bracket was found
		} else {
			// set the string to return to the incoming string
			stringToReturn = incomingString;
		}
		// return the result
		return stringToReturn;
	},

	/**
	 * @name ReturnCopyOfObject
	 * @function
	 * @description Return a deep / unique copy of an object 
	 * (as opposed to a reference to the original object).
	 * @param {string} incomingObject - e.g., any valid object
	 */

	ReturnCopyOfObject: (incomingObject) => JSON.parse(JSON.stringify(incomingObject)),

	/**
	 * @name ReturnSubstringPrecedingNewLineCharacters
	 * @function
	 * @description Return substring preceding '\r' and/or '\n' characters.
	 * @param {string} incomingString - e.g., 'Web & Mobile Application Developer\r\n'
	 */

	ReturnSubstringPrecedingNewLineCharacters: (incomingString) => {
		// determine positions of new line characters
		const positionOfR = incomingString.search('\\r');
		const positionOfN = incomingString.search('\\n');
		// set up string to return
		let stringToReturn;
		// if there is a new line character
		if (positionOfR !== -1 || positionOfN !== -1) {
			let positionOfFirstNewLineCharacter;
			// if there's only an R
			if (positionOfR !== -1 || positionOfN === -1) {
			// that's the position of the first new line character
				positionOfFirstNewLineCharacter = positionOfR;
			}
			// if there's only an N
			if (positionOfR === -1 || positionOfN !== -1) {
			// that's the position of the first new line character
				positionOfFirstNewLineCharacter = positionOfN;
			}
			// if there are both
			if (positionOfR !== -1 && positionOfN !== -1) {
			// if R comes first
				if (positionOfR < positionOfN) {
				// that's the position of the first new line character
					positionOfFirstNewLineCharacter = positionOfR;
				}
				// if N comes first
				if (positionOfR > positionOfN) {
				// that's the position of the first new line character
					positionOfFirstNewLineCharacter = positionOfN;
				}
			}
			// set the string to return to the portion preceding the new line character
			stringToReturn = 
			incomingString.substring(0, positionOfFirstNewLineCharacter);
			// if there is NOT a new line character
		} else {
		// set the string to return to the incoming string
			stringToReturn = incomingString;
		}
		// return the result
		return stringToReturn;
	},

	/**
	 * @name ReplaceAll
	 * @function
	 * @description Return substring preceding '\r' and/or '\n' characters.
	 * @param {string} needle - string to search for
	 * @param {string} replacementNeedle - string to replace needle
	 * @param {string} haystack - string to search in
	 */

	ReplaceAll: (needle, replacementNeedle, haystack) => haystack.replace(new RegExp(needle, 'g'), replacementNeedle),

	/**
	 * @name ReturnArrayElementExists
	 * @function
	 * @description Return true if element is in array, false if not.
	 * @param {string} testArray - array to test
	 * @param {string} testElement - element for which to test
	 */

	ReturnArrayElementExists: (testArray, testElement) => testArray.indexOf(testElement) > -1,

	/**
	 * @name ReturnFormattedDateTime
	 * @function
	 * @description Use moment.js to calculate and format times. 
	 * Present for backward compatibility; should use moment 
	 * directly going forward.
	 * @param {string} incomingDateTimeString - predefined token or 
	 * moment-parsable representation of datetime; 
	 * e.g., 'nowLocal', 'nowUTC', 'April 19, 2020'
	 * @param {(string|null)} incomingFormat - null or moment-compatible 
	 * indication of format of incomingDateTimeString; 
	 * e.g., null, 'YYYY-MM-DDTHH:mm:ssZ'
	 * @param {(string|null)} incomingReturnFormat - null or moment-compatible 
	 * indication of format of datetime string to return; 
	 * e.g., null, 'YYYY-MM-DDTHH:mm:ssZ'
	 * @param {(number|null)} determineYearDisplayDynamically - if 1, 
	 * the datetime's year will only be included if it is not the current year; 
	 * e.g., null, 0, 1
	 */

	ReturnFormattedDateTime: ({
		incomingDateTimeString,
		incomingFormat,
		incomingReturnFormat,
		determineYearDisplayDynamically,
	}) => {
		// config locale
		moment.locale('en');
		moment.suppressDeprecationWarnings = true;
		// set up vars
		let returnValue = '';
		let dateTimeStringToUse = '';
		let returnFormatToUse = incomingReturnFormat;
		// if incomingDateTimeString is set to 'nowLocal', reset to string representing current datetime
		if (incomingDateTimeString === 'nowLocal') {
			dateTimeStringToUse = moment().format();
			// otherise, if incomingDateTimeString is 'nowUTC', use string representing current datetime
		} else if (incomingDateTimeString === 'nowUTC') {
			dateTimeStringToUse = moment().format('YYYY-MM-DDTHH:mm:ssZ');
		} else {
			dateTimeStringToUse = incomingDateTimeString;
		}
		// if need to determine year display dynamically
		//		(essentially, we'll only display year if it's not the current year)
		if (typeof (determineYearDisplayDynamically) !== 'undefined') {
			if (determineYearDisplayDynamically === 1) {
				let displayYear = '';
				// if dateTimeStringToUse's year != the current year
				if (moment(dateTimeStringToUse).format('YYYY') !== moment().format('YYYY')) {
					// set flag to display year
					displayYear = 1;
					// otherwise
				} else {
					// set flag to not display year
					displayYear = 0;
				}
				// if displayYear == 1 and incomingReturnFormat doesn't contain the year
				if (displayYear === 1 && module.exports.StrInStr({
					incomingHaystack: incomingReturnFormat,
					incomingNeedle: ', YYYY',
					flag: 0,
				}) === false) {
					// add the year to returnFormatToUse
					returnFormatToUse += ', YYYY';
				}
				// if displayYear == 0 and incomingReturnFormat DOES contain the year
				if (displayYear === 0 && module.exports.StrInStr({
					incomingHaystack: incomingReturnFormat,
					incomingNeedle: ', YYYY',
					flag: 0,
				}) !== false) {
					// remove the year from returnFormat
					returnFormatToUse = module.exports.ReplaceAll(', YYYY', '', returnFormatToUse);
				}
			}
		}
		// if incoming format is null, assume dateTimeStringToUse is in iso format
		if (incomingFormat == null) {
			// if incomingReturnFormat is null
			if (incomingReturnFormat == null) {
				// use iso format to format dateTimeStringToUse
				returnValue += moment(dateTimeStringToUse, incomingFormat).format();
				// if return format is not null
			} else {
				// use return format to format dateTimeStringToUse
				returnValue += moment(dateTimeStringToUse, incomingFormat).format(returnFormatToUse);
			}
			// if incoming format is not null, use it to parse dateTimeStringToUse
		} else {
			/** if incomingFormat contains ', YYYY' and dateTimeStringToUse doesn't end with that 
			 * value and determineYearDisplayDynamically == 1
			 * (E.g., incomingFormat == 'MMMM D, YYYY' and dateTimeStringToUse is only 'February 14'
			 */
			if (module.exports.StrInStr({
				incomingHaystack: incomingFormat,
				incomingNeedle: ', YYYY',
			}) !== false && module.exports.StrInStr({
				incomingHaystack: dateTimeStringToUse,
				incomingNeedle: ', 2',
			}) === false && typeof (determineYearDisplayDynamically) !== 'undefined' && determineYearDisplayDynamically === 1) {
				// augment with the current year
				//  (since determineYearDisplayDynamically == 1, should be safe assumption (until it isn't))
				dateTimeStringToUse += `, ${moment().format('YYYY')}`;
			}
			// if return format is null
			if (returnFormatToUse == null) {
				// use iso format to format dateTimeStringToUse
				returnValue += moment(dateTimeStringToUse, incomingFormat).format();
				// if return format is not null
			} else {
				// use return format to format dateTimeStringToUse
				returnValue += moment(dateTimeStringToUse, incomingFormat).format(returnFormatToUse);
			}
		}
		return returnValue;
	},
};
