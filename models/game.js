const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
	user: {type: String, index: true},
	id: {type: Number, index: true},
	grid: [String],
	winner: String
});

module.exports = mongoose.model('Game', gameSchema);