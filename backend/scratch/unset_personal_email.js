const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const StudentSchema = new mongoose.Schema({}, { strict: false });
const Student = mongoose.model('Student', StudentSchema);

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');
        
        const result = await Student.updateMany({}, { $unset: { personalEmail: "" } });
        console.log(`Updated ${result.modifiedCount} student documents. Removed 'personalEmail'.`);
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
