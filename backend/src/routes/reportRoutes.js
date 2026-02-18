const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const reportController = require('../controllers/reportController');

// Middleware to check if user is analyst
const isAnalyst = (req, res, next) => {
    if (req.user.role !== 'analyst') {
        return res.status(403).json({ error: 'Access denied. Analyst role required.' });
    }
    next();
};

// Generate report (analyst only)
router.post('/generate', authMiddleware, isAnalyst, reportController.generateReport);

// Get reports
router.get('/', authMiddleware, reportController.getReports);

// Get single report
router.get('/:id', authMiddleware, reportController.getReportById);

// Delete report (analyst only)
router.delete('/:id', authMiddleware, isAnalyst, reportController.deleteReport);

module.exports = router;
