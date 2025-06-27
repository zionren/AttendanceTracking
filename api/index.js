const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const attendanceRoutes = require('../routes/attendance');
const adminRoutes = require('../routes/admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'admin.html'));
});

app.get('/admin-attendance', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'admin-attendance.html'));
});

app.get('/setup', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'setup.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
