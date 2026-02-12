const mongoose = require('mongoose');

const connectDB = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/partnership_analytics';
    const dbName = process.env.MONGODB_DB || 'partnership_analytics';
    await mongoose.connect(uri, { dbName });
    console.log('MongoDB connected');
};

module.exports = { connectDB };
