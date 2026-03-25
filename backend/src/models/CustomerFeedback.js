const mongoose = require('mongoose');

const customerFeedbackSchema = new mongoose.Schema({
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true,
        index: true
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    // The partner's daily narrative feedback (visible to partner + analyst only)
    dayFeedback: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000
    },
    // Legacy / optional fields (kept for backwards compatibility)
    totalCustomers: { type: Number, min: 0, default: null },
    satisfiedCustomers: { type: Number, min: 0, default: null },
    overallRating: { type: Number, min: 1, max: 5, default: null },
    complaints: { type: String, trim: true, default: '' },
    highlights: { type: String, trim: true, default: '' }
}, { timestamps: true });

// Compound index for efficient daily queries per branch
customerFeedbackSchema.index({ branchId: 1, date: -1 });

module.exports = mongoose.model('CustomerFeedback', customerFeedbackSchema);
