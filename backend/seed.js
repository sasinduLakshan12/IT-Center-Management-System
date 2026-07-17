const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Admin Seeding...');

        const adminEmail = 'admin@univ.ac.lk';
        const adminPassword = 'admin123';

        // පරණ admin record එකක් තිබුණොත් delete කරනවා
        await Admin.deleteOne({ email: adminEmail });

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await Admin.create({
            studentId: 'ADMIN001',
            name: 'System Administrator',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            loginAttempts: 0,
            lockUntil: null
        });

        console.log('Admin account created successfully!');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);

        await mongoose.connection.close();
        console.log('Database connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('Admin seeding error:', error);
        process.exit(1);
    }
};

seedAdmin();