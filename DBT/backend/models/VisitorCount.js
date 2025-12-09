const mongoose = require('mongoose');

const visitorCountSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now,
    unique: true // One document per day
  },
  count: {
    type: Number,
    required: true,
    default: 0
  },
  // Optional: Store counts by hour if needed
  hourlyCounts: [{
    hour: Number,
    count: Number
  }]
}, {
  timestamps: true
});

// Create a compound index for date queries
visitorCountSchema.index({ date: 1 });

module.exports = mongoose.model('VisitorCount', visitorCountSchema);