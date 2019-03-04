const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	username: {type: String, index: true},
	password: String,
	sid: String,
	email: {type: String, index: true},
	enabled: {type: String, default: "False"},
	games: {type: [{id:Number, start_date:String}], default: []},
	humanscore: {type: Number, default: 0},
	serverscore: {type: Number, default: 0},
	ties: {type: Number, default: 0},
	gameId: {type: Number, default: 0}
});

module.exports = mongoose.model('User', userSchema);