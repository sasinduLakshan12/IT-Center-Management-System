const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const PC = require('./models/PC');
const User = require('./models/User');

dotenv.config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');

        // 1. Clear existing data
        await PC.deleteMany({});
        await User.deleteMany({ role: 'admin' }); // Only clear admin users to avoid losing registered test users

        console.log('Cleared existing PCs and Admin users.');

        // 2. Add sample PCs (PC-01 to PC-40)
        const pcs = [];
        const rows = ['Row A', 'Row B', 'Row C', 'Row D'];
        
        for (let i = 1; i <= 40; i++) {
            const rowIndex = Math.floor((i - 1) / 10);
            const statusRandom = Math.random();
            let status = 'available';
            let issueReported = null;

            // Make some PCs occupied, booked, or out-of-order for a realistic initial UI
            if (statusRandom < 0.15) {
                status = 'occupied';
            } else if (statusRandom < 0.25) {
                status = 'booked';
            } else if (statusRandom < 0.3) {
                status = 'out-of-order';
                issueReported = 'Keyboard not responding / Mouse broken';
            }

            pcs.push({
                pcId: `PC-${String(i).padStart(2, '0')}`,
                status,
                location: rows[rowIndex],
                issueReported
            });
        }

        await PC.insertMany(pcs);
        console.log(`Successfully seeded ${pcs.length} PCs!`);

        // 3. Add default Admin user if not exists
        const adminEmail = 'admin@univ.ac.lk';
        const adminExists = await User.findOne({ email: adminEmail });
        
        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);

            await User.create({
                studentId: 'ADMIN001',
                name: 'System Administrator',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                isApproved: true
            });
            console.log('Successfully seeded default Admin account:');
            console.log(`Email: ${adminEmail}`);
            console.log('Password: admin123');
        } else {
            console.log('Admin user already exists.');
        }

        mongoose.connection.close();
        console.log('Database Seeding Completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
