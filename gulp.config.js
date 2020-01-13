// eslint-disable-next-line import/no-extraneous-dependencies
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

module.exports = {
	ReturnReformattedDirectoryToken: (directoryToken) => {
		let directoryTokenToUse = directoryToken;
		if (directoryTokenToUse.substr(0, 1) === '/') {
			directoryTokenToUse = directoryTokenToUse.substr(1);
		}
		return directoryTokenToUse;
	},
	ReturnEventPath: (eventToken, directoryToken) => {
		let eventPath = 'src/Lambdas/sample-event.js';
		if (eventToken) {
			eventPath = `src/Lambdas/${directoryToken}/event.js`;
		}
		return eventPath;
	},
	ReturnLLFunctionWatchLocation: (directoryToken) => {
		const directoryTokenToUse = module.exports.ReturnReformattedDirectoryToken(directoryToken);
		return `src/Lambdas/${directoryTokenToUse}`;
	},
	ReturnLLFunctionRunCommand: (directoryToken, functionToken, eventToken) => {
		const directoryTokenToUse = module.exports.ReturnReformattedDirectoryToken(directoryToken);
		const eventPath = module.exports.ReturnEventPath(eventToken, directoryToken);
		return `lambda-local -l src/Lambdas/${directoryTokenToUse}/index.js -h ${functionToken} -e ${eventPath} -E '{"mongoDbHostUnique": "${process.env.mongoDbHostUnique}","mongoDbUser":"${process.env.mongoDbUser}","mongoDbPass":"${process.env.mongoDbPass}","stage":"dev","isLocal":true}'`;
	},
};