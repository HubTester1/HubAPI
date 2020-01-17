/**
 * @name UltiPro
 * @service
 * @description Query the UltiPro EmployeeChangesAPI
 */

const axios = require('axios');

if (process.env.NODE_ENV === 'local') {
	// eslint-disable-next-line global-require
	const dotenv = require('dotenv');
	dotenv.config({ path: '../../../.env' });
}

module.exports = {

	/**
	 * @name ReturnOneSetOfEmployeesFromUltiPro
	 * @function
	 * @async
	 * @description Return all active employees from the UltiPro EmployeeChanges API
	 * @param upApiKey - Environment variable,
	 * stored in AWS Systems Manager, Parameter store
	 * @param upEmployeeChangesPass - Environment variable,
	 * stored in AWS Systems Manager, Parameter store
	 * @param upEmployeeChangesUser - Environment variable,
	 * stored in AWS Systems Manager, Parameter store
	 */

	ReturnOneSetOfEmployeesFromUltiPro: () =>
	// return a new promise
		new Promise((resolve, reject) => {
			// Get the username and password from the accountData file
			const userPass = `${process.env.upEmployeeChangesUser}:${process.env.upEmployeeChangesPass}`;

			// Used to convert username + password to base 64 encoded string for API Authorization
			const buf = Buffer.from(userPass, 'ascii');
			const base64BasicAuth = `Basic ${buf.toString('base64')}`;

			// Create headers
			const headers = {
				Authorization: base64BasicAuth,
				'US-Customer-Api-Key': process.env.upApiKey,
				'Content-Type': 'application/json',
			};

			// How long to wait in MS before timing out on the request (50000 = 50 seconds)
			const timeout = 50000;

			const instance = axios.create({
				baseURL: 'https://service4.ultipro.com/personnel/v1/employee-changes?page=1&per_page=200&startDate=1900-12-31T00:00:00Z&endDate=2199-12-31T00:00:00Z',
				timeout,
				headers,
			});
			instance.get()
			// if the promise is resolved
				.then((result) => {
				// if status indicates success
					if (result.status === 200) {
						console.log(result);
						console.log('-----RESULT = 200');
						// resolve this promise with the list items  
						resolve({
							data: result.data.value,
						});
					} else {
						console.log(result);
						console.log('-----RESULT !!!= 200');
						// construct a custom error
						const errorToReport = {
							error: true,
							ultiProError: true,
							ultiProErrorDetails: 'response not 200',
						};
						// reject this promise with the error
						reject(errorToReport);
					}
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					console.log(error);
					console.log('-----ERROR');
					reject(error);
				});
		}),

	/**
	 * @name ReturnAllActiveEmployeesFromUltiPro
	 * @function
	 * @async
	 * @description Return all active employees from the UltiPro EmployeeChanges API
	 */


	ReturnAllActiveEmployeesFromUltiPro: () =>
		// return a new promise
		new Promise((resolve, reject) => {
		}),
};
