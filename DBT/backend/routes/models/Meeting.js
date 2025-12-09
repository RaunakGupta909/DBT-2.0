const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
    meetingId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    organizerType: {
        type: String,
        enum: ['teacher', 'parent', 'admin'],
        required: true
    },
    organizerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'organizerType'
    },
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        userType: {
            type: String,
            enum: ['teacher', 'parent', 'student', 'admin'],
            required: true
        },
        name: String,
        email: String,
        status: {
            type: String,
            enum: ['invited', 'accepted', 'declined', 'attended', 'absent'],
            default: 'invited'
        },
        joinedAt: Date,
        leftAt: Date
    }],
    scheduledTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in minutes
        default: 30
    },
    status: {
        type: String,
        enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    meetingType: {
        type: String,
        enum: ['one-on-one', 'group', 'class', 'parent-teacher'],
        default: 'parent-teacher'
    },
    meetingLink: String,
    recordingUrl: String,
    agenda: String,
    notes: String,
    attachments: [{
        filename: String,
        url: String,
        uploadedBy: mongoose.Schema.Types.ObjectId,
        uploadedAt: Date
    }],
    chatMessages: [{
        senderId: mongoose.Schema.Types.ObjectId,
        senderName: String,
        senderType: String,
        message: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        readBy: [mongoose.Schema.Types.ObjectId]
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes
MeetingSchema.index({ scheduledTime: 1 });
MeetingSchema.index({ organizerId: 1 });
MeetingSchema.index({ 'participants.userId': 1 });
MeetingSchema.index({ status: 1 });

module.exports = mongoose.model('Meeting', MeetingSchema);