const router = express.Router();
const cassandra = require('../cassandra');
const Answer = require('../models/answer');
const Question = require('../models/question');
const User = require('../models/user');

router.get('/reset', function (req, res) {
    let query = "TRUNCATE ?";
    cassandra.execute(query, "media",{prepare: true},function (err, result) {
        if(err)
            return res.status(400).json({status: "error", error: "Error truncating cassandra"});
        Answer.deleteMany({}, function (err, result) {
            if(err)
                return res.status(400).json({status: "error", error: "Error removing Mongo Collection: Answer"});
            Question.deleteMany({}, function (err, result) {
                if(err)
                    return res.status(400).json({status: "error", error: "Error removing Mongo Collection: Question"});
                User.deleteMany({}, function (err, result) {
                    if(err)
                        return res.status(400).json({status: "error", error: "Error removing Mongo Collection: User"});
                    res.json({status: "OK", message:"Successfully deleted everything from database."})
                })
            })
        });
    });
});

module.exports = router;