const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const AdminSchema = new mongoose.Schema({}, { strict: false });
const Admin = mongoose.model('Admin', AdminSchema);

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Atlas MongoDB.');
        const admins = await Admin.find({});
        console.log('Admins in Atlas:', JSON.stringify(admins, null, 2));
        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
};

run();
