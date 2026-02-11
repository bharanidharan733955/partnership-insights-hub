const prisma = require('../prisma');

const submitSales = async (req, res) => {
    try {
        const { date, productName, quantity, salesAmount, profit } = req.body;
        const { branchId } = req.user;

        const record = await prisma.salesRecord.upsert({
            where: {
                date_branchId_productName: {
                    date: new Date(date),
                    branchId,
                    productName
                }
            },
            update: { quantity, salesAmount, profit },
            create: {
                date: new Date(date),
                branchId,
                productName,
                quantity,
                salesAmount,
                profit
            }
        });

        res.json(record);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const getSalesHistory = async (req, res) => {
    try {
        const { role, partnerId, branchId } = req.user;
        let where = {};

        if (role === 'PARTNER') {
            where = { branchId };
        } else {
            // Analyst filters
            const { partnerId: fPartnerId, branchId: fBranchId, startDate, endDate } = req.query;
            if (fBranchId) where.branchId = fBranchId;
            else if (fPartnerId) where.branch = { partnerId: fPartnerId };

            if (startDate || endDate) {
                where.date = {};
                if (startDate) where.date.gte = new Date(startDate);
                if (endDate) where.date.lte = new Date(endDate);
            }
        }

        const sales = await prisma.salesRecord.findMany({
            where,
            include: { branch: { include: { partner: true } } },
            orderBy: { date: 'desc' }
        });

        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { submitSales, getSalesHistory };
