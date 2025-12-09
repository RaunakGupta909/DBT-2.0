const mongoose = require('mongoose');

const villageSchema = new mongoose.Schema({
    villageId: {
        type: String,
        required: true,
        unique: true
    },
    villageName: {
        type: String,
        required: true
    },
    blockId: {
        type: String,
        required: true
    },
    blockName: String,
    district: String,
    state: String,
    // Geographic coordinates
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    // DBT Statistics
    dbtStats: {
        totalUsers: Number,
        dbtEnabled: Number,
        aadhaarLinked: Number,
        aadhaarNotLinked: Number,
        lastSyncDate: Date,
        coveragePercentage: Number
    },
    // Population data
    population: {
        total: Number,
        male: Number,
        female: Number,
        children: Number
    },
    // School data
    schools: [{
        schoolId: String,
        schoolName: String,
        dbtCoverage: Number
    }],
    // Issues reported
    issues: [{
        type: {
            type: String,
            enum: ['aadhaar_issue', 'bank_account', 'technical', 'other']
        },
        count: Number,
        resolved: Number
    }],
    // Metadata
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Village', villageSchema);