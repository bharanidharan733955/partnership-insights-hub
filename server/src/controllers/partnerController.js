const Partner = require('../models/Partner');

const getPartners = async (req, res) => {
    try {
        const { role, partnerId } = req.user;
        let query = {};
        if (role === 'PARTNER') {
            query = { _id: partnerId };
        }

        const partners = await Partner.find(query).lean();

        const Branch = require('../models/Branch');
        const result = [];
        for (const p of partners) {
            const branches = await Branch.find({ partnerId: p._id }).lean();
            result.push({
                ...p,
                id: p._id.toString(),
                branches: branches.map(b => ({
                    ...b,
                    id: b._id.toString(),
                    partner_id: b.partnerId?.toString(),
                    partners: { name: p.name },
                })),
            });
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createPartner = async (req, res) => {
    try {
        const { name } = req.body;
        const partner = await Partner.create({ name });
        res.status(201).json({ id: partner._id.toString(), ...partner.toObject() });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const createBranch = async (req, res) => {
    try {
        const Branch = require('../models/Branch');
        const { partnerId, name, location } = req.body;
        const branch = await Branch.create({ partnerId, name, location });
        res.status(201).json({ id: branch._id.toString(), ...branch.toObject() });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = { getPartners, createPartner, createBranch };
