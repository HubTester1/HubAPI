/**
 * @name DataConnection
 * @service
 * @description Service facilitating all connections between Lambda functions and MongoDB Atlas.
 */

const { connect } = require('mongoose');

const CachedConnections = {};


module.exports.DataConnection = (dbName) => {
	if (!CachedConnections[dbName]) {
		CachedConnections[dbName] = connect(process.env.mongoDbUriDev, {
			dbName,
			useNewUrlParser: true,
			useUnifiedTopology: true,
			bufferCommands: false,
			bufferMaxEntries: 0,
		});
	}
	return CachedConnections[dbName];
};
