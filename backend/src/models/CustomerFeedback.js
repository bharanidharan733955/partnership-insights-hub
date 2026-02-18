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
    totalCustomers: {
        type: Number,
        required: true,
        min: 0
    },
    satisfiedCustomers: {
        type: Number,
        required: true,
        min: 0
    },
    overallRating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    complaints: {
        type: String,
        trim: true,
        default: ''
    },
    highlights: {
        type: String,
        trim: true,
        default: ''
    }
}, { timestamps: true });

// Compound index for efficient daily queries per branch
customerFeedbackSchema.index({ branchId: 1, date: -1 });

module.exports = mongoose.model('CustomerFeedback', customerFeedbackSchema);
