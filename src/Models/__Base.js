/**
 * @name XXX
 * @model
 * @description XXX
 */

const mongoose = require('mongoose');
const validator = require('validator');

module.exports.model = mongoose.model('XXX', {
	XXX: {
		type: String,
		required: true,
		validate: {
			validator(name) {
				return validator.isAlphanumeric(name);
			},
		},
	},
});
