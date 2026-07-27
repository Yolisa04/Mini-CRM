const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  note: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Note', noteSchema);
