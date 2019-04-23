const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mediaSchema = new Schema({
	_id: {type: String, unique: true},
	used: {type: Boolean, default: false}
});

module.exports = mongoose.model('Media', mediaSchema);