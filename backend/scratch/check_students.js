const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const StudentSchema = new mongoose.Schema({}, { strict: false });
const Student = mongoose.model('Student', StudentSchema);

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');
        const students = await Student.find({});
        console.log('Students in database:', JSON.stringify(students, null, 2));
        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
};

run();
