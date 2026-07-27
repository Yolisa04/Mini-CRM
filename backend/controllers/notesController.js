const Note = require('../models/Note');
const Activity = require('../models/Activity');

// @desc    Get notes for a lead
// @route   GET /api/leads/:id/notes
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ leadId: req.params.id })
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a note to a lead
// @route   POST /api/leads/:id/notes
exports.addNote = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note) {
      return res.status(400).json({ message: 'Note content is required' });
    }

    const newNote = await Note.create({
      leadId: req.params.id,
      author: req.user._id,
      note
    });

    // Log activity
    await Activity.create({
      leadId: req.params.id,
      user: req.user._id,
      action: 'note_added',
      newValue: note
    });

    const populatedNote = await Note.findById(newNote._id).populate('author', 'name');
    res.status(201).json(populatedNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
