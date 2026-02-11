const bcrypt = require('bcryptjs');

let users = [];
let partners = [];
let branches = [];
let salesRecords = [];

const initMockData = async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const partner1 = { id: 'p1', name: 'TechSolutions Inc' };
    const branch1 = { id: 'b1', name: 'South Branch', location: 'Bangalore', partnerId: 'p1' };

    partners.push(partner1);
    branches.push(branch1);

    users.push({
        id: 'u1',
        email: 'analyst@enterprise.com',
        password: hashedPassword,
        name: 'Global Analyst',
        role: 'ANALYST'
    });

    users.push({
        id: 'u2',
        email: 'manager1@techsolutions.com',
        password: hashedPassword,
        name: 'John Doe',
        role: 'PARTNER',
        partnerId: 'p1',
        branchId: 'b1'
    });

    // Seed some sales
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        salesRecords.push({
            id: `s${i}`,
            date,
            productName: 'Enterprise Suite',
            quantity: Math.floor(Math.random() * 10) + 1,
            salesAmount: Math.random() * 5000 + 1000,
            profit: Math.random() * 1000 + 200,
            branchId: 'b1'
        });
    }
};

initMockData().catch(err => {
    console.error('Failed to initialize mock data:', err);
});

const prismaMock = {
    user: {
        findUnique: async ({ where }) => users.find(u => u.email === where.email),
        create: async ({ data }) => {
            const newUser = { id: `u${users.length + 1}`, ...data };
            users.push(newUser);
            return newUser;
        }
    },
    partner: {
        findMany: async ({ include }) => partners.map(p => ({ ...p, branches: branches.filter(b => b.partnerId === p.id) })),
        findUnique: async ({ where }) => partners.find(p => p.id === where.id),
        create: async ({ data }) => {
            const newPartner = { id: `p${partners.length + 1}`, ...data };
            partners.push(newPartner);
            return newPartner;
        }
    },
    branch: {
        findMany: async () => branches,
        findUnique: async ({ where }) => branches.find(b => b.id === where.id),
        create: async ({ data }) => {
            const newBranch = { id: `b${branches.length + 1}`, ...data };
            branches.push(newBranch);
            return newBranch;
        }
    },
    salesRecord: {
        findMany: async ({ where }) => {
            let filtered = salesRecords;
            if (where.branchId) filtered = filtered.filter(s => s.branchId === where.branchId);
            return filtered.map(s => ({ ...s, branch: branches.find(b => b.id === s.branchId) }));
        },
        groupBy: async ({ by }) => {
            if (by.includes('date')) {
                const groups = {};
                salesRecords.forEach(s => {
                    const d = s.date.toISOString().split('T')[0];
                    if (!groups[d]) groups[d] = { date: s.date, _sum: { salesAmount: 0, profit: 0, quantity: 0 } };
                    groups[d]._sum.salesAmount += s.salesAmount;
                    groups[d]._sum.profit += s.profit;
                    groups[d]._sum.quantity += s.quantity;
                });
                return Object.values(groups);
            }
            if (by.includes('branchId')) {
                const groups = {};
                salesRecords.forEach(s => {
                    if (!groups[s.branchId]) groups[s.branchId] = { branchId: s.branchId, _sum: { salesAmount: 0 } };
                    groups[s.branchId]._sum.salesAmount += s.salesAmount;
                });
                return Object.values(groups);
            }
        },
        upsert: async ({ create }) => {
            const newRecord = { id: `s${salesRecords.length + 1}`, ...create };
            salesRecords.push(newRecord);
            return newRecord;
        }
    }
};

module.exports = prismaMock;
