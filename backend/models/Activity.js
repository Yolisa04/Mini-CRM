const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['created', 'updated', 'status_changed', 'note_added', 'assigned'],
    required: true
  },
  oldValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Activity', activitySchema);
