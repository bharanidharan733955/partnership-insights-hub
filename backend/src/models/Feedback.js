const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    branch_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true,
        index: true
    },
    analyst_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    category: {
        type: String,
        required: true,
        enum: ['sales', 'performance', 'communication', 'compliance']
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    issues: [{
        type: String,
        trim: true
    }],
    suggestions: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['pending', 'acknowledged', 'resolved'],
        default: 'pending'
    },
    reply: {
        type: String,
        trim: true,
        default: ''
    },
    repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    repliedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for efficient queries
feedbackSchema.index({ branch_id: 1, date: -1 });
feedbackSchema.index({ analyst_id: 1, date: -1 });

// Virtual for branch details
feedbackSchema.virtual('branch', {
    ref: 'Branch',
    localField: 'branch_id',
    foreignField: '_id',
    justOne: true
});

// Virtual for analyst details
feedbackSchema.virtual('analyst', {
    ref: 'User',
    localField: 'analyst_id',
    foreignField: '_id',
    justOne: true
});

// Ensure virtuals are included in JSON
feedbackSchema.set('toJSON', { virtuals: true });
feedbackSchema.set('toObject', { virtuals: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
