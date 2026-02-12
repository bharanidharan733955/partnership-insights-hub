const SalesRecord = require('../models/SalesRecord');
const Branch = require('../models/Branch');

const getOverview = async (req, res) => {
    try {
        const trends = await SalesRecord.aggregate([
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, sales: { $sum: '$salesAmount' }, profit: { $sum: '$profit' }, quantity: { $sum: '$quantity' } } },
            { $sort: { _id: 1 } }
        ]);

        const comparison = await SalesRecord.aggregate([
            { $group: { _id: '$branchId', sales: { $sum: '$salesAmount' } } }
        ]);

        const branchIds = comparison.filter(c => c._id).map(c => c._id);
        const branches = branchIds.length ? await Branch.find({ _id: { $in: branchIds } }).select('_id name').lean() : [];
        const branchMap = branches.reduce((acc, b) => ({ ...acc, [b._id.toString()]: b.name }), {});

        res.json({
            trends: trends.map(d => ({ date: d._id, sales: d.sales, profit: d.profit, quantity: d.quantity })),
            comparison: comparison.map(c => ({ name: branchMap[c._id?.toString()] || 'Unknown', sales: c.sales })),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getOverview };
