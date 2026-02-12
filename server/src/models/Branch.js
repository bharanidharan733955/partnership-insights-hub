const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Branch', branchSchema);
