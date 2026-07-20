const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Start background cron jobs
const startCronJobs = require('./utils/cronJobs');
startCronJobs();

const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/computers', require('./routes/computerRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/programmes', require('./routes/programmeRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/time-slots', require('./routes/timeSlotRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/waiting-list', require('./routes/waitingListRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));


// Basic test route
app.get('/', (req, res) => {
    res.json({ message: 'IT Center Management System API is running...' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
