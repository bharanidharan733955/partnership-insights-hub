const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

const login = async (email, password) => {
    const user = await prisma.user.findUnique({
        where: { email },
        include: { partner: true, branch: true }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
        { id: user.id, role: user.role, partnerId: user.partnerId, branchId: user.branchId },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1d' }
    );

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            partner: user.partner,
            branch: user.branch
        },
        token
    };
};

const register = async (userData) => {
    const { email, password, name, role, partnerId, branchId } = userData;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role,
            partnerId,
            branchId
        }
    });

    return { id: user.id, email: user.email, name: user.name, role: user.role };
};

module.exports = { login, register };
