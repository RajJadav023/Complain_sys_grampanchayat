const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

const authRoutes = require('./routes/authRoutes');
const complainRoutes = require('./routes/complainRoutes');
const eventRoutes = require('./routes/eventRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Middleware
app.use((req, res, next) => {
    // console.log(`${req.method} ${req.url}`);
    next();
});
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Serve uploaded files (photos / documents attached to complaints)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complainRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
    res.send('DCMS API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
