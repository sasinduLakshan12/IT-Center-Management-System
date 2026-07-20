require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');

async function fixStudents() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const result = await Student.updateMany(
    { status: 'Email Verification Pending' },
    { $set: { status: 'Approved' } }
  );
  
  console.log(`Updated ${result.modifiedCount} students from 'Email Verification Pending' to 'Approved'.`);
  process.exit(0);
}
fixStudents();
