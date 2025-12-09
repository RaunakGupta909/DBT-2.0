const mongoose = require('mongoose');

const DBTStatusSchema = new mongoose.Schema({
    aadhaarNumber: {
        type: String,
        required: true,
        unique: true,
        length: 12
    },
    linkedWithBank: {
        type: Boolean,
        default: false
    },
    dbtEnabled: {
        type: Boolean,
        default: false
    },
    lastAmount: {
        type: Number,
        default: 0
    },
    lastTransactionDate: Date,
    verificationDate: Date,
    remarks: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
DBTStatusSchema.index({ aadhaarNumber: 1 });
DBTStatusSchema.index({ dbtEnabled: 1 });

module.exports = mongoose.model('DBTStatus', DBTStatusSchema);