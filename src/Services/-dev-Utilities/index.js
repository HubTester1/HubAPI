/**
 * @name Utilities
 * @service
 * @description Miscellaneous utility functions
 */


/**
 * @name ReturnAccountFromUserAndDomain
 * @function
 * @description Return substring preceding '@' character.
 * @param {string} incomingString - e.g., 'sp1@mos.org'
 */

module.exports.ReturnAccountFromUserAndDomain = (incomingString) => incomingString.substring(0, incomingString.search('@')).trim();
/**
 * @name ReturnCopyOfObject
 * @function
 * @description Return a deep / unique copy of an object 
 * (as opposed to a reference to the original object).
 * @param {string} incomingObject - e.g., any valid object
 */

module.exports.ReturnCopyOfObject = (incomingObject) => JSON.parse(JSON.stringify(incomingObject));

/**
 * @name ReturnSubstringPrecedingNewLineCharacters
 * @function
 * @description Return substring preceding '\r' and/or '\n' characters.
 * @param {string} incomingString - e.g., 'Web & Mobile Application Developer\r\n'
 */

module.exports.ReturnSubstringPrecedingNewLineCharacters = (incomingString) => {
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
};
