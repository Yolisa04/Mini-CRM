const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  message: {
    type: String
  },
  source: {
    type: String,
    enum: ['Website', 'Facebook', 'Instagram', 'LinkedIn', 'Referral', 'Google Ads', 'Cold Email', 'Walk In', 'Phone Call'],
    default: 'Website'
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Converted', 'Lost'],
    default: 'New'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Update timestamp on save
leadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Lead', leadSchema);
