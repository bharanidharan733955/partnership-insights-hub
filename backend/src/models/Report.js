const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['daily', 'weekly', 'monthly']
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    branch_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        index: true
    },
    metrics: {
        average_rating: {
            type: Number,
            min: 0,
            max: 5
        },
        total_feedback: {
            type: Number,
            default: 0
        },
        issues_count: {
            type: Number,
            default: 0
        },
        resolved_count: {
            type: Number,
            default: 0
        }
    },
    generated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
reportSchema.index({ type: 1, date: -1 });
reportSchema.index({ branch_id: 1, date: -1 });

// Virtual for branch details
reportSchema.virtual('branch', {
    ref: 'Branch',
    localField: 'branch_id',
    foreignField: '_id',
    justOne: true
});

// Ensure virtuals are included in JSON
reportSchema.set('toJSON', { virtuals: true });
reportSchema.set('toObject', { virtuals: true });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
