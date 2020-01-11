
const moment = require('moment');

exports.returnCurrentTime = async (event, context, callback) => ({
	statusCode: 200,
	body: JSON.stringify(moment.now()),
});
