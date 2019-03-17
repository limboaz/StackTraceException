const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');


// TODO Make emails unique, for some reason it is possible to have two users with the same email
const userSchema = new mongoose.Schema({
	username: {
		type: String,
		index: true,
		unique: true,
		required: [true, "User name can't be blank"],
	},
	password: {
		type: String,
		required: [true, "Please enter a password"]
	},
	sid: String,
	email: {
		type: String,
		index: true,
		unique: true,
		required: [true, "Email can't be blank"],
		match: [/\S+@\S+\.\S+/, 'Email you entered is invalid, please use proper format example@somewhere.com ']
	},
	enabled: {type: String, default: "False"},
});

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', userSchema);