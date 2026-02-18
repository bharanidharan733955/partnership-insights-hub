const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const feedbackController = require('../controllers/feedbackController');

// Middleware to check if user is analyst
const isAnalyst = (req, res, next) => {
    if (req.user.role !== 'analyst' && req.user.role !== 'ANALYST') {
        return res.status(403).json({ error: 'Access denied. Analyst role required.' });
    }
    next();
};

// Middleware to check if user is partner or analyst
const isPartnerOrAnalyst = (req, res, next) => {
    const role = req.user.role;
    if (role !== 'PARTNER' && role !== 'ANALYST' && role !== 'analyst') {
        return res.status(403).json({ error: 'Access denied.' });
    }
    next();
};

// Create feedback (analyst only)
router.post('/', authMiddleware, isAnalyst, feedbackController.createFeedback);

// Get feedback for a specific branch
router.get('/branch/:branchId', authMiddleware, feedbackController.getFeedbackByBranch);

// Get all feedback (analyst only)
router.get('/', authMiddleware, isAnalyst, feedbackController.getAllFeedback);

// Get feedback statistics
router.get('/stats', authMiddleware, feedbackController.getFeedbackStats);

// Update feedback status
router.patch('/:id', authMiddleware, feedbackController.updateFeedbackStatus);

// Analyst reply to feedback (analyst only)
router.patch('/:id/reply', authMiddleware, isAnalyst, feedbackController.replyToFeedback);

// Delete feedback (analyst only)
router.delete('/:id', authMiddleware, isAnalyst, feedbackController.deleteFeedback);

// Customer feedback routes (PARTNER / manager)
router.post('/customer', authMiddleware, isPartnerOrAnalyst, feedbackController.createCustomerFeedback);
router.get('/customer', authMiddleware, isPartnerOrAnalyst, feedbackController.getCustomerFeedback);

module.exports = router;
