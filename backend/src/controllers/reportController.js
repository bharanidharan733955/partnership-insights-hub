const Report = require('../models/Report');
const Feedback = require('../models/Feedback');

// Generate report
exports.generateReport = async (req, res) => {
    try {
        const { type, branch_id, startDate, endDate } = req.body;

        if (!['daily', 'weekly', 'monthly'].includes(type)) {
            return res.status(400).json({ error: 'Invalid report type' });
        }

        // Build feedback query
        const query = {};
        if (branch_id) query.branch_id = branch_id;

        const start = new Date(startDate);
        const end = new Date(endDate);
        query.date = { $gte: start, $lte: end };

        // Aggregate feedback data
        const stats = await Feedback.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    average_rating: { $avg: '$rating' },
                    total_feedback: { $sum: 1 },
                    issues_count: { $sum: { $size: '$issues' } },
                    resolved_count: {
                        $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                    }
                }
            }
        ]);

        const metrics = stats[0] || {
            average_rating: 0,
            total_feedback: 0,
            issues_count: 0,
            resolved_count: 0
        };

        // Create report
        const report = new Report({
            type,
            date: new Date(),
            branch_id: branch_id || null,
            metrics,
            generated_by: req.user.id
        });

        await report.save();
        await report.populate('branch');

        res.status(201).json(report);
    } catch (error) {
        console.error('Generate report error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};

// Get reports
exports.getReports = async (req, res) => {
    try {
        const { type, branchId, startDate, endDate } = req.query;

        // Build query
        const query = {};
        if (type) query.type = type;
        if (branchId) query.branch_id = branchId;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const reports = await Report.find(query)
            .populate('branch')
            .sort({ date: -1 });

        res.json(reports);
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
};

// Get single report
exports.getReportById = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await Report.findById(id).populate('branch');

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json(report);
    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
};

// Delete report
exports.deleteReport = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await Report.findByIdAndDelete(id);

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Delete report error:', error);
        res.status(500).json({ error: 'Failed to delete report' });
    }
};
