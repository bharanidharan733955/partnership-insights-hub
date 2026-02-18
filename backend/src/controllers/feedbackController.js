const Feedback = require('../models/Feedback');
const Branch = require('../models/Branch');
const CustomerFeedback = require('../models/CustomerFeedback');

// Create new feedback
exports.createFeedback = async (req, res) => {
    try {
        const { branch_id, date, rating, category, comment, issues, suggestions } = req.body;

        // Validate branch exists
        const branch = await Branch.findById(branch_id);
        if (!branch) {
            return res.status(404).json({ error: 'Branch not found' });
        }

        // Create feedback
        const feedback = new Feedback({
            branch_id,
            analyst_id: req.user.id,
            date: date || new Date(),
            rating,
            category,
            comment,
            issues: issues || [],
            suggestions: suggestions || []
        });

        await feedback.save();

        // Populate branch and analyst details
        await feedback.populate('branch analyst');

        res.status(201).json(feedback);
    } catch (error) {
        console.error('Create feedback error:', error);
        res.status(500).json({ error: 'Failed to create feedback' });
    }
};

// Get feedback for a specific branch
exports.getFeedbackByBranch = async (req, res) => {
    try {
        const { branchId } = req.params;
        const { startDate, endDate } = req.query;

        // Build query
        const query = { branch_id: branchId };

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const feedback = await Feedback.find(query)
            .populate('branch analyst')
            .sort({ date: -1 });

        res.json(feedback);
    } catch (error) {
        console.error('Get feedback by branch error:', error);
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
};

// Get all feedback (analyst only)
exports.getAllFeedback = async (req, res) => {
    try {
        const { date, branchId } = req.query;

        // Build query
        const query = {};
        if (branchId) query.branch_id = branchId;
        if (date) {
            const queryDate = new Date(date);
            const nextDay = new Date(queryDate);
            nextDay.setDate(nextDay.getDate() + 1);
            query.date = { $gte: queryDate, $lt: nextDay };
        }

        const feedback = await Feedback.find(query)
            .populate('branch analyst')
            .sort({ date: -1 });

        res.json(feedback);
    } catch (error) {
        console.error('Get all feedback error:', error);
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
};

// Update feedback status
exports.updateFeedbackStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'acknowledged', 'resolved'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const feedback = await Feedback.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('branch analyst');

        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        res.json(feedback);
    } catch (error) {
        console.error('Update feedback status error:', error);
        res.status(500).json({ error: 'Failed to update feedback' });
    }
};

// Analyst reply to feedback
exports.replyToFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { reply } = req.body;

        if (!reply || !reply.trim()) {
            return res.status(400).json({ error: 'Reply text is required' });
        }

        const feedback = await Feedback.findByIdAndUpdate(
            id,
            {
                reply: reply.trim(),
                repliedBy: req.user.id,
                repliedAt: new Date(),
                status: 'acknowledged'
            },
            { new: true }
        ).populate('branch analyst repliedBy');

        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        res.json(feedback);
    } catch (error) {
        console.error('Reply to feedback error:', error);
        res.status(500).json({ error: 'Failed to submit reply' });
    }
};

// Delete feedback (analyst only)
exports.deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;

        const feedback = await Feedback.findByIdAndDelete(id);

        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        res.json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        console.error('Delete feedback error:', error);
        res.status(500).json({ error: 'Failed to delete feedback' });
    }
};

// Get feedback statistics
exports.getFeedbackStats = async (req, res) => {
    try {
        const { branchId, startDate, endDate } = req.query;

        // Build match query
        const match = {};
        if (branchId) match.branch_id = branchId;
        if (startDate || endDate) {
            match.date = {};
            if (startDate) match.date.$gte = new Date(startDate);
            if (endDate) match.date.$lte = new Date(endDate);
        }

        const stats = await Feedback.aggregate([
            { $match: match },
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

        res.json(stats[0] || {
            average_rating: 0,
            total_feedback: 0,
            issues_count: 0,
            resolved_count: 0
        });
    } catch (error) {
        console.error('Get feedback stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

// Submit daily customer feedback (PARTNER / manager)
exports.createCustomerFeedback = async (req, res) => {
    try {
        const { date, totalCustomers, satisfiedCustomers, overallRating, complaints, highlights } = req.body;
        const { branchId, id: submittedBy } = req.user;

        if (!branchId) {
            return res.status(400).json({ error: 'No branch assigned to your account' });
        }

        // Validate branch exists
        const branch = await Branch.findById(branchId);
        if (!branch) {
            return res.status(404).json({ error: 'Branch not found' });
        }

        const feedback = new CustomerFeedback({
            branchId,
            submittedBy,
            date: date ? new Date(date) : new Date(),
            totalCustomers,
            satisfiedCustomers,
            overallRating,
            complaints: complaints || '',
            highlights: highlights || ''
        });

        await feedback.save();
        res.status(201).json(feedback);
    } catch (error) {
        console.error('Create customer feedback error:', error);
        res.status(500).json({ error: 'Failed to submit customer feedback' });
    }
};

// Get customer feedback for a branch (PARTNER sees own branch; ANALYST sees all)
exports.getCustomerFeedback = async (req, res) => {
    try {
        const { role, branchId: userBranchId } = req.user;
        const { branchId, startDate, endDate } = req.query;

        const query = {};

        if (role === 'PARTNER') {
            query.branchId = userBranchId;
        } else if (branchId) {
            query.branchId = branchId;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const feedbackList = await CustomerFeedback.find(query)
            .populate('branchId', 'name location')
            .populate('submittedBy', 'name email')
            .sort({ date: -1 });

        res.json(feedbackList);
    } catch (error) {
        console.error('Get customer feedback error:', error);
        res.status(500).json({ error: 'Failed to fetch customer feedback' });
    }
};
