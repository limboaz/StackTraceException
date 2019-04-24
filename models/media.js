const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mediaSchema = new Schema({
	_id: String,
	used: {type: Boolean, default: false},
	user: {type: String, index: true}
});

module.exports = mongoose.model('Media', mediaSchema);