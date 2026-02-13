const mongoose = require('mongoose');

const salesRecordSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    salesAmount: { type: Number, required: true },
    profit: { type: Number, required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
}, { timestamps: true });

salesRecordSchema.index({ date: 1, branchId: 1, productName: 1 }, { unique: true });

module.exports = mongoose.model('SalesRecord', salesRecordSchema);
