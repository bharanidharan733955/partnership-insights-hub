const SalesRecord = require('../models/SalesRecord');
const Branch = require('../models/Branch');

const submitSales = async (req, res) => {
    try {
        const { date, productName, quantity, salesAmount, profit } = req.body;
        const { branchId } = req.user;

        const record = await SalesRecord.findOneAndUpdate(
            { date: new Date(date), branchId, productName },
            { quantity, salesAmount, profit },
            { returnDocument: 'after', upsert: true, runValidators: true }
        )
            .populate({ path: 'branchId', populate: { path: 'partnerId' } });

        const r = record.toObject();
        r.id = r._id.toString();
        r.branch = r.branchId;
        r.branchId = r.branchId?._id?.toString();
        if (r.branch) {
            r.branch.partner = r.branch.partnerId ? { id: r.branch.partnerId._id?.toString(), name: r.branch.partnerId.name } : null;
        }
        res.json(r);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const getSalesHistory = async (req, res) => {
    try {
        const { role, partnerId, branchId } = req.user;
        let query = {};

        if (role === 'PARTNER') {
            query = { branchId };
        } else {
            const { partnerId: fPartnerId, branchId: fBranchId, startDate, endDate } = req.query;
            if (fBranchId) query.branchId = fBranchId;
            else if (fPartnerId) {
                const branches = await Branch.find({ partnerId: fPartnerId }).select('_id');
                query.branchId = { $in: branches.map(b => b._id) };
            }

            if (startDate || endDate) {
                query.date = {};
                if (startDate) query.date.$gte = new Date(startDate);
                if (endDate) query.date.$lte = new Date(endDate);
            }
        }

        const sales = await SalesRecord.find(query)
            .populate({ path: 'branchId', populate: { path: 'partnerId' } })
            .sort({ date: -1 });

        const formatted = sales.map(s => {
            const o = s.toObject();
            o.id = o._id.toString();
            const branch = o.branchId;
            o.branchId = branch?._id?.toString();
            o.branch = branch ? {
                id: branch._id?.toString(),
                name: branch.name,
                location: branch.location,
                partnerId: branch.partnerId?._id?.toString(),
                partner: branch.partnerId ? { id: branch.partnerId._id?.toString(), name: branch.partnerId.name } : null,
            } : null;
            return o;
        });

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { submitSales, getSalesHistory };
