const mongoose = require('mongoose');

const DBTRecordSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    aadhaarNumber: {
        type: String,
        required: true,
        length: 12
    },
    schemeName: {
        type: String,
        required: true,
        enum: ['Post-Matric Scholarship', 'Pre-Matric Scholarship', 'Merit Scholarship', 'Fee Reimbursement']
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    disbursementDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'disbursed', 'failed'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        unique: true
    },
    bankReference: String,
    academicYear: {
        type: String,
        required: true
    },
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
DBTRecordSchema.index({ studentId: 1, disbursementDate: -1 });
DBTRecordSchema.index({ aadhaarNumber: 1 });
DBTRecordSchema.index({ status: 1 });

module.exports = mongoose.model('DBTRecord', DBTRecordSchema);