const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Partner = require('../models/Partner');
const Branch = require('../models/Branch');

const login = async (email, password) => {
    // Populate the referenced partner/branch IDs, not non‑existent paths
    const user = await User.findOne({ email })
        .populate('partnerId')
        .populate('branchId');

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid email or password');
    }

    const partnerDoc = user.partnerId;
    const branchDoc = user.branchId;
    const partnerId = partnerDoc?._id ? partnerDoc._id.toString() : (user.partnerId ? user.partnerId.toString() : null);
    const branchId = branchDoc?._id ? branchDoc._id.toString() : (user.branchId ? user.branchId.toString() : null);

    const token = jwt.sign(
        { id: user._id.toString(), role: user.role, partnerId, branchId },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1d' }
    );

    const role = (user.role || '').toLowerCase();
    return {
        user: {
            id: user._id.toString(),
            user_id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: role === 'analyst' ? 'analyst' : 'partner',
            branch_id: branchId,
            partner_id: partnerId,
            partner: partnerDoc
                ? { id: partnerDoc._id.toString(), name: partnerDoc.name }
                : null,
            branch: branchDoc
                ? {
                    id: branchDoc._id.toString(),
                    name: branchDoc.name,
                    location: branchDoc.location,
                }
                : null,
        },
        token
    };
};

const register = async (userData) => {
    const { email, password, name, branchName, branchLocation } = userData;

    const existing = await User.findOne({ email });
    if (existing) throw new Error('Email already registered');

    if (!branchName || !branchLocation) throw new Error('Branch name and location are required');

    const hashedPassword = await bcrypt.hash(password, 10);

    const partner = await Partner.create({ name });
    const branch = await Branch.create({
        name: branchName,
        location: branchLocation,
        partnerId: partner._id
    });
    const user = await User.create({
        email,
        password: hashedPassword,
        name,
        role: 'PARTNER',
        partnerId: partner._id,
        branchId: branch._id
    });

    const token = jwt.sign(
        { id: user._id.toString(), role: 'PARTNER', partnerId: partner._id.toString(), branchId: branch._id.toString() },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
    );

    return {
        user: {
            id: user._id.toString(),
            user_id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: 'partner',
            branch_id: branch._id.toString(),
            partner_id: partner._id.toString(),
            branch: { id: branch._id.toString(), name: branch.name, location: branch.location },
            partner: { id: partner._id.toString(), name: partner.name },
        },
        token
    };
};

module.exports = { login, register };
