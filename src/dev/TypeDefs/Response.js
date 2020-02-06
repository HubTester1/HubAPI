/**
 * One response object
 * @typedef {object} Response
 * @property {boolean} processError - whether or not to process error
 * @property {boolean} emergencyError - whether or not error is 
 * an emergency, demanding immediate attention from administrator
 * @property {number} statusCode - HTTP response code
 * @property {Function} responder - function to be used to send 
 * response; e.g., resolve, reject, callback
 * @property {object} content - data containing Lambda function's 
 * event and context parameters and results or errors from 
 * operations. 
 */
