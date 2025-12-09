const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
    blockId: {
        type: String,
        required: true,
        unique: true
    },
    blockName: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    centerLat: {
        type: Number,
        required: true
    },
    centerLng: {
        type: Number,
        required: true
    },
    totalSchools: {
        type: Number,
        default: 0
    },
    avgCoverage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    totalBeneficiaries: {
        type: Number,
        default: 0
    },
    totalIssues: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

blockSchema.index({ blockId: 1 });
blockSchema.index({ district: 1 });
blockSchema.index({ state: 1 });

module.exports = mongoose.model('Block', blockSchema);