const mongoose = require('mongoose');
const shortid = require('shortid');
var uniqueValidator = require('mongoose-unique-validator');


const userSchema = new mongoose.Schema({
	username: {
		type: String,
		index: {unique: true},
		required: [true, "User name can't be blank"],
	},
	password: {
		type: String,
		required: [true, "Please enter a password"]
	},
	reputation: {type: Number, default: 1},
	real_reputation: {type: Number, default: 1},
	email: {
		type: String,
		index: {unique: true},
		required: [true, "Email can't be blank"],
		match: [/\S+@\S+\.\S+/, 'Email you entered is invalid, please use proper format example@somewhere.com ']
	},
	enabled: {type: String, default: "False"},
});


userSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', userSchema);
