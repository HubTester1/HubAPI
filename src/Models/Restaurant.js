/**
 * @name InsertRestaurant
 * @model
 * @category Sample
 * @description This is the restaurant insertion function in the Sample API.
 */

const { Schema, model } = require('mongoose');
// const validator = require('validator');

const RestaurantSchema = new Schema({
	borough: String,
	cuisine: String,
});

module.exports = model('Restaurant', RestaurantSchema);

/* const model = mongoose.model('User', {
	name: {
		type: String,
		required: true,
		validate: {
			validator(name) {
				return validator.isAlphanumeric(name);
			},
		},
	},
	firstname: {
		type: String,
		required: true,
		validate: {
			validator(firstname) {
				return validator.isAlphanumeric(firstname);
			},
		},
	},
	birth: {
		type: Date,
		required: true,
	},
	city: {
		type: String,
		required: true,
		validate: {
			validator(city) {
				return validator.isAlphanumeric(city);
			},
		},
	},
	ip: {
		type: String,
		required: true,
		validate: {
			validator(ip) {
				return validator.isIP(ip);
			},
		},
	},
});

module.exports = model; */
