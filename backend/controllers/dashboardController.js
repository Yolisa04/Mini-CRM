const Lead = require('../models/Lead');
const Activity = require('../models/Activity');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
exports.getStats = async (req, res) => {
  try {
    const total = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: 'New' });
    const contacted = await Lead.countDocuments({ status: 'Contacted' });
    const qualified = await Lead.countDocuments({ status: 'Qualified' });
    const converted = await Lead.countDocuments({ status: 'Converted' });
    const lost = await Lead.countDocuments({ status: 'Lost' });

    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : 0;

    // Recent activities (limit 10)
    const recentActivity = await Activity.find()
      .populate('user', 'name')
      .populate('leadId', 'firstName lastName email')
      .sort({ timestamp: -1 })
      .limit(10);

    // Lead sources breakdown
    const sources = await Lead.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);

    // Monthly lead creation (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthly = await Lead.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      total,
      newLeads,
      contacted,
      qualified,
      converted,
      lost,
      conversionRate,
      recentActivity,
      sources,
      monthly
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

