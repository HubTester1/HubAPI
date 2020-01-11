/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
/**
 * @name DataQueries
 * @service
 * @description Service facilitating all data queries from Lambda functions to MongoDB Atlas,
 */

const { connection, Schema, model } = require('mongoose');
const { DataConnection } = require('./DataConnection');

module.exports.InsertDoc = async (dbName, doc, collection, callback) => {
	DataConnection(dbName);

	let cxnResult;

	connection.on('error', () => {
		cxnResult = 'CXN ERROR';
		callback(null, {
			statusCode: 200,
			body: JSON.stringify({
				cxnResult,
			}),
		});
	});
	connection.once('open', () => {
		cxnResult = 'CXN SUCCESS';
		const kittySchema = new Schema({
			name: String,
		});
		const Kitten = model('Kitten', kittySchema);
		const fluffy = new Kitten({
			name: 'fluffy',
		});
		fluffy.save((error, result) => {
			if (error) {
				callback(null, {
					statusCode: 200,
					body: JSON.stringify({
						cxnResult,
						error,
					}),
				});
			} else {
				callback(null, {
					statusCode: 200,
					body: JSON.stringify({
						cxnResult,
						result,
					}),
				});
			}
		});
	});
};
