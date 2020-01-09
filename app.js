const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb+srv://aws-user:hFbB7CZNTEhhBv2cK6YcaVedmny3LXVLFriY3@dev-api-qmmhr.mongodb.net/test?retryWrites=true&w=majority';

// Database Name
const dbName = 'Travel';

// Use connect method to connect to the server
MongoClient.connect(url, (err, client) => {
	if (!err) {
		console.log('Connected successfully to server');
	
		const db = client.db(dbName);
		console.log('Reading this db name');
		console.log(db);
	
		client.close();
	} else {
		console.log('Could not connect!');
	}
});
