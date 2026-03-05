const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for Google OAuth users
    googleId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['ANALYST', 'PARTNER'], default: 'PARTNER' },
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
