const mongoose = require('mongoose');
const session = require('express-session');
const Mongoose = require('connect-mongo')(session);

mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);

mongoose.connect('mongodb://10.3.5.211:27017/STE', function (err) {
    if (err) {
        console.error(err.toString());
        process.exit(1);
    }
});
const mongoStore = new Mongoose({mongooseConnection: mongoose.connection});

module.exports = mongoStore;