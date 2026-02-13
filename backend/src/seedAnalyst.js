const bcrypt = require('bcryptjs');
const User = require('./models/User');

const ANALYST_EMAIL = process.env.ANALYST_EMAIL || 'analyst@enterprise.com';
const ANALYST_PASSWORD = process.env.ANALYST_PASSWORD || 'password123';
const ANALYST_NAME = process.env.ANALYST_NAME || 'Global Analyst';

async function seedAnalyst() {
    const existing = await User.findOne({ role: 'ANALYST' });
    if (existing) {
        console.log('Analyst user already exists');
        return;
    }

    const hashedPassword = await bcrypt.hash(ANALYST_PASSWORD, 10);
    await User.create({
        email: ANALYST_EMAIL,
        password: hashedPassword,
        name: ANALYST_NAME,
        role: 'ANALYST',
    });
    console.log(`Analyst created: ${ANALYST_EMAIL}`);
}

module.exports = { seedAnalyst };
