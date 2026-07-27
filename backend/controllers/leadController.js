const Lead = require('../models/Lead');
const Note = require('../models/Note');
const Activity = require('../models/Activity');
const { validationResult } = require('express-validator');

// @desc    Get all leads (with search, filter, pagination)
// @route   GET /api/leads
exports.getLeads = async (req, res) => {
  try {
    const { search, status, source, assignedTo, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (source) filter.source = source;
    if (assignedTo) filter.assignedTo = assignedTo;

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Lead.countDocuments(filter);
    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      leads,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Get notes and activity
    const notes = await Note.find({ leadId: lead._id }).populate('author', 'name');
    const activities = await Activity.find({ leadId: lead._id })
      .populate('user', 'name')
      .sort({ timestamp: -1 });

    res.json({ lead, notes, activities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new lead
// @route   POST /api/leads
exports.createLead = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const leadData = req.body;
    // If not provided, set default status
    if (!leadData.status) leadData.status = 'New';

    const lead = await Lead.create(leadData);

    // Log activity
    await Activity.create({
      leadId: lead._id,
      user: req.user._id,
      action: 'created',
      newValue: { status: lead.status }
    });

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a lead
// @route   PUT /api/leads/:id
exports.updateLead = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Track changes for activity log
    const oldStatus = lead.status;
    const oldAssignedTo = lead.assignedTo;

    // Update
    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    // Log status change
    if (req.body.status && req.body.status !== oldStatus) {
      await Activity.create({
        leadId: lead._id,
        user: req.user._id,
        action: 'status_changed',
        oldValue: oldStatus,
        newValue: req.body.status
      });
    }

    // Log assignment change
    if (req.body.assignedTo && req.body.assignedTo !== oldAssignedTo?.toString()) {
      await Activity.create({
        leadId: lead._id,
        user: req.user._id,
        action: 'assigned',
        oldValue: oldAssignedTo,
        newValue: req.body.assignedTo
      });
    }

    res.json(updatedLead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Delete related notes and activities
    await Note.deleteMany({ leadId: lead._id });
    await Activity.deleteMany({ leadId: lead._id });
    await Lead.deleteOne({ _id: lead._id });

    res.json({ message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

