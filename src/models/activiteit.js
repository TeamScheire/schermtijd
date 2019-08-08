var mongoose = require('mongoose');

// Setup schema
var activiteitSchema = mongoose.Schema({
    titel: {
        type: String,
        required: true
    },
    beschrijving: {
        type: String,
        required: true,
        maxlength: 100
    },
    materiaal: {
        type: String,
        maxlength: 100
    },
    create_date: {
        type: Date,
        default: Date.now
    },
    modified_date: {
        type: Date
    }
}, {
    collection: 'activiteit'
});

// Export Contact model
var Activiteit = module.exports = mongoose.model('activiteit', activiteitSchema);

module.exports.get = function (callback, limit) {
    Activiteit.find(callback).limit(limit);
}