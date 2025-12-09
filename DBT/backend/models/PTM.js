const mongoose = require('mongoose');

const InviteSchema = new mongoose.Schema({
  aadhaar: String,
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  respondedAt: Date
}, {_id:false});

const PTMSchema = new mongoose.Schema({
  title: { type: String, default: 'Parent-Teacher Meeting' },
  purpose: String,
  scheduledAt: Date,
  createdBy: String,
  invites: [InviteSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PTM', PTMSchema);
