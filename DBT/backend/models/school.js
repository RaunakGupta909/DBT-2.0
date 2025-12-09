const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    schoolId: {
        type: String,
        required: true,
        unique: true
    },
    schoolName: {
        type: String,
        required: true
    },
    blockId: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    dbtCoverage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    beneficiaries: {
        type: Number,
        default: 0
    },
    issuesReported: {
        type: Number,
        default: 0
    },
    lastTransactionDate: Date,
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'active'
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
});

module.exports = mongoose.model('School', schoolSchema);