require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    const { seedAnalyst } = require('./seedAnalyst');
    await seedAnalyst();
    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log('Backend process ID:', process.pid);
    });
    server.on('error', (err) => {
        console.error('Server failed to start:', err);
    });
};

startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
