require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Backend process ID:', process.pid);
});

server.on('error', (err) => {
    console.error('Server failed to start:', err);
});

// Keep-alive heartbeat
setInterval(() => {
    // console.log('Backend heartbeat...');
}, 10000);

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
