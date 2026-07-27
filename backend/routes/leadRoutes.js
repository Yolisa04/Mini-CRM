const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead
} = require('../controllers/leadController');
const { getNotes, addNote } = require('../controllers/notesController');

const router = express.Router();

router.use(protect); // All lead routes require authentication

router.route('/')
  .get(getLeads)
  .post([
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('phone').optional({ checkFalsy: true }).isLength({ min: 7 }).withMessage('Phone number looks too short')
  ], createLead);

router.route('/:id')
  .get(getLeadById)
  .put([
    body('email').optional().isEmail().withMessage('Valid email required')
  ], updateLead)
  .delete(deleteLead);

// Notes
router.route('/:id/notes')
  .get(getNotes)
  .post(addNote);

module.exports = router;
