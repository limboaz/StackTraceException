const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	username: {type: String, index: true},
	password: String,
	sid: String,
	email: {type: String, index: true},
	enabled: {type: String, default: "False"},
});

module.exports = mongoose.model('User', userSchema);