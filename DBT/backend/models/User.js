const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    aadhaarNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    name: String,
    fatherName: String,
    villageId: String,
    blockId: String,
    // DBT Status
    dbtStatus: {
        type: String,
        enum: ['enabled', 'disabled', 'pending'],
        default: 'pending'
    },
    aadhaarStatus: {
        type: String,
        enum: ['linked', 'not_linked', 'verification_pending'],
        default: 'not_linked'
    },
    bankAccount: {
        accountNumber: String,
        bankName: String,
        ifscCode: String,
        verified: Boolean
    },
    // Benefits received
    benefits: [{
        schemeName: String,
        amount: Number,
        transactionId: String,
        date: Date,
        status: String
    }],
    // Contact info
    contact: {
        phone: String,
        email: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUpdated: Date
});

module.exports = mongoose.model('User', userSchema);