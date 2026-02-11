const prisma = require('../prisma');

const getOverview = async (req, res) => {
    try {
        const { role, partnerId, branchId } = req.user;

        // Aggregate sales data
        const salesData = await prisma.salesRecord.groupBy({
            by: ['date'],
            _sum: {
                salesAmount: true,
                profit: true,
                quantity: true
            },
            orderBy: { date: 'asc' }
        });

        const branchComparison = await prisma.salesRecord.groupBy({
            by: ['branchId'],
            _sum: {
                salesAmount: true
            }
        });

        // Get branch names for comparison
        const branches = await prisma.branch.findMany({
            select: { id: true, name: true }
        });

        const branchMap = branches.reduce((acc, b) => ({ ...acc, [b.id]: b.name }), {});

        const formattedComparison = branchComparison.map(c => ({
            name: branchMap[c.branchId] || 'Unknown',
            sales: c._sum.salesAmount
        }));

        res.json({
            trends: salesData.map(d => ({
                date: d.date.toISOString().split('T')[0],
                sales: d._sum.salesAmount,
                profit: d._sum.profit
            })),
            comparison: formattedComparison
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getOverview };
