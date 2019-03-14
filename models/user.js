const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	username: {type: String, index: true, unique: true, required: [true, "User name can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'This username is invalid, please use only letters a-z, A-Z, or digits 0-9']},
	password: String,
	sid: String,
	email: {type: String, index: true, required: [true, "Email can't be blank"], match: [/\S+@\S+\.\S+/, 'Email you entered is invalid, please use proper format example@somewhere.com ']},
	enabled: {type: String, default: "False"},
});

module.exports = mongoose.model('User', userSchema);