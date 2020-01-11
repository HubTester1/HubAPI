/**
 * @name DataConnection
 * @service
 * @description Return connection to either dev or prod db in MongoDB Atlas service.
 */

const monk = require('monk');

const connectTimeoutMS = 30000;
const socketTimeoutMS = 30000;

module.exports = monk(`mongodb+srv://${process.env.mongoDbUser}:${process.env.mongoDbPass}@${process.env.stage}${process.env.mongoDbHostUnique}/${process.env.stage}?retryWrites=true&w=majority&connectTimeoutMS=${connectTimeoutMS}&socketTimeoutMS=${socketTimeoutMS}`);
