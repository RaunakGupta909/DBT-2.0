const mongoose = require('mongoose');

const AttendeeSchema = new mongoose.Schema({
  aadhaar: String,
  name: String,
  joinedAt: { type: Date, default: Date.now }
});

const MeetingSchema = new mongoose.Schema({
  title: { type: String, default: 'Parent-Teacher Meeting' },
  scheduledAt: Date,
  link: String,
  createdBy: String,
  ended: { type: Boolean, default: false },
  endedAt: Date,
  attendees: [AttendeeSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Meeting', MeetingSchema);
