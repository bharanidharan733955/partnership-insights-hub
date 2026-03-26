const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const salesRoutes = require('./routes/salesRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

/* ================= CORS CONFIG ================= */

const allowedOrigins = [
  "https://partnership-insights-hub-frontend-y.vercel.app",
  "http://localhost:8080"
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log("Incoming Origin:", origin);

    // allow no-origin requests (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.error("❌ Blocked by CORS:", origin);
      return callback(null, false); // IMPORTANT: do NOT throw error
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

// 🔥 APPLY CORS FIRST
app.use(cors(corsOptions));

// 🔥 HANDLE PREFLIGHT
app.options('*', cors(corsOptions));

/* ================= MIDDLEWARE ================= */

app.use(express.json());

/* ================= ROUTES ================= */

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/', (req, res) =>
  res.send("Partnership Analytics API is running")
);

app.use('/api/auth', authRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/reports', reportRoutes);

/* ================= ERROR HANDLER (CRITICAL) ================= */

app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

module.exports = app;