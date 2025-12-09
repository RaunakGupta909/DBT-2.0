const mongoose = require('mongoose');

const heatmapDataSchema = new mongoose.Schema({
    blockId: String,
    date: {
        type: Date,
        default: Date.now
    },
    dataType: {
        type: String,
        enum: ['coverage', 'issues', 'transactions', 'beneficiaries']
    },
    heatPoints: [{
        lat: Number,
        lng: Number,
        intensity: Number,
        schoolId: String,
        value: Number
    }],
    stats: {
        minValue: Number,
        maxValue: Number,
        avgValue: Number,
        totalPoints: Number
    }
});

module.exports = mongoose.model('HeatmapData', heatmapDataSchema);