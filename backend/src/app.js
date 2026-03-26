const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const salesRoutes = require('./routes/salesRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:8080'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/', (req, res) => res.send(`Partnership Analytics API is running. Access the UI at ${process.env.FRONTEND_URL || 'http://localhost:8080'}`));

app.use('/api/auth', authRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/reports', reportRoutes);

module.exports = app;
