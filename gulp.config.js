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
	ReturnLambdaDirectory: (directoryToken) => {
		const directoryTokenToUse = module.exports.ReturnReformattedDirectoryToken(directoryToken);
		return `src/Lambdas/${directoryTokenToUse}`;
	},
	ReturnServiceFunctionRunCommand: (directoryToken, functionToken) => {
		const directoryTokenToUse = module.exports.ReturnReformattedDirectoryToken(directoryToken);
		return `NODE_ENV=local node-dev -e 'require("node src/Services/${directoryTokenToUse}").${functionToken}()'`;
	},
	ReturnLLFunctionRunCommand: (directoryToken, functionToken, eventToken) => {
		const directoryTokenToUse = module.exports.ReturnReformattedDirectoryToken(directoryToken);
		const eventPath = module.exports.ReturnEventPath(eventToken, directoryToken);
		return `lambda-local -l src/Lambdas/${directoryTokenToUse}/index.js -h ${functionToken} -e ${eventPath} --envfile .env --timeout 30000`;
	},
};
