const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Partner = require('../models/Partner');
const Branch = require('../models/Branch');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

const googleLogin = async (idToken) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        let user = await User.findOne({ email })
            .populate('partnerId')
            .populate('branchId');

        if (!user) {
            throw new Error('User not found. Please register an account first.');
        }

        // Link googleId if not already present
        if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
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
                picture, // Optional: useful for UI
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
    } catch (err) {
        throw new Error(err.message || 'Google authentication failed');
    }
};

const googleRegister = async ({ idToken, name, password, branchName, branchLocation }) => {
    try {
        // Verify the Google ID token to get the authenticated email
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email: googleEmail } = payload;

        if (!googleEmail) {
            throw new Error('Could not retrieve email from Google account.');
        }

        // Check if user already exists
        const existing = await User.findOne({ email: googleEmail });
        if (existing) {
            throw new Error('This Google account is already registered. Please sign in instead.');
        }

        if (!branchName || !branchLocation) {
            throw new Error('Branch name and location are required.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const partner = await Partner.create({ name: name || payload.name });
        const branch = await Branch.create({
            name: branchName,
            location: branchLocation,
            partnerId: partner._id
        });
        const user = await User.create({
            email: googleEmail,
            password: hashedPassword,
            googleId,
            name: name || payload.name,
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
    } catch (err) {
        throw new Error(err.message || 'Google registration failed.');
    }
};

module.exports = { login, register, googleLogin, googleRegister };
