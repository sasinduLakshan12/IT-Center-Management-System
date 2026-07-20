require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Student = require('./models/Student');
const TimeSlot = require('./models/TimeSlot');

async function testEndpoint() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Find a student
  const student = await Student.findOne({});
  if (!student) {
    console.log("No student found");
    process.exit(1);
  }

  // Generate token
  const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
  
  // Fake request
  const slots = await TimeSlot.find({}).sort({ startTime: 1 });
  console.log("Found slots directly from DB:", slots.length);

  // Now let's try the actual axios call like the frontend does
  try {
    const res = await fetch('http://localhost:5000/api/time-slots', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("API response status:", res.status);
    const data = await res.json();
    console.log("API response data slots length:", data.data ? data.data.length : data);
  } catch (err) {
    console.log("API request failed:", err);
  }

  process.exit(0);
}
testEndpoint();
