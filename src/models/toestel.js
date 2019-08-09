var mongoose = require('mongoose');

// Setup schema
var scoreSchema = mongoose.Schema({
    score: {
        type: Number,
        required: true,
        default: 0
    },
    beschrijving: {
        type: String
    },
    create_date: {
        type: Date,
        default: Date.now
    },
});

var toestelSchema = mongoose.Schema({
    adres: {
        type: String,
        required: true
    },
    eigenaar: {
        type: String
    },
    create_date: {
        type: Date,
        default: Date.now
    },
    score: {
        type: Number,
        default: 0
    },
    scores: {
        type: [scoreSchema],
    },
    modified_date: {
        type: Date
    }
}, {
    collection: 'toestel'
});

// Export Contact model
var Toestel = module.exports = mongoose.model('toestel', toestelSchema);

module.exports.get = function (callback, limit) {
    Toestel.find(callback).limit(limit);
}