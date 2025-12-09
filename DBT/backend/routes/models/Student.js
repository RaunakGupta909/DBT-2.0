const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    collegeId: {
        type: String,
        required: true,
        unique: true
    },
    aadhaarNumber: {
        type: String,
        required: true,
        unique: true,
        length: 12
    },
    fatherName: String,
    fatherAadhaar: String,
    motherName: String,
    phone: {
        type: String,
        required: true
    },
    email: String,
    course: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    bankDetails: {
        bankName: String,
        accountNumber: String,
        ifscCode: String,
        branch: String
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

// Indexes for faster queries
StudentSchema.index({ aadhaarNumber: 1 });
StudentSchema.index({ fatherAadhaar: 1 });
StudentSchema.index({ collegeId: 1 });

module.exports = mongoose.model('Student', StudentSchema);