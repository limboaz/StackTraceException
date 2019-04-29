const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');


// TODO Make emails unique, for some reason it is possible to have two users with the same email
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
}, {shardKey: {username: "hashed"}});


userSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', userSchema);
