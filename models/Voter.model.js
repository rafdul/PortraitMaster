const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
    user: {type: Number, required: true},
    votes: [{type: String, required: true}],
});

module.exports = mongoose.model('Voter', voterSchema);