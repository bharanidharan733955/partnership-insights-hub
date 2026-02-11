const prisma = require('../prisma');

const getPartners = async (req, res) => {
    try {
        const { role, partnerId } = req.user;
        let where = {};
        if (role === 'PARTNER') {
            where = { id: partnerId };
        }
        const partners = await prisma.partner.findMany({
            where,
            include: { branches: true }
        });
        res.json(partners);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createPartner = async (req, res) => {
    try {
        const { name } = req.body;
        const partner = await prisma.partner.create({ data: { name } });
        res.status(201).json(partner);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const createBranch = async (req, res) => {
    try {
        const { partnerId, name, location } = req.body;
        const branch = await prisma.branch.create({
            data: { partnerId, name, location }
        });
        res.status(201).json(branch);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = { getPartners, createPartner, createBranch };
