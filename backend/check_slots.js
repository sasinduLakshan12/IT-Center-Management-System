require('dotenv').config();
const mongoose = require('mongoose');
const TimeSlot = require('./models/TimeSlot');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const slots = await TimeSlot.find({});
  console.log(JSON.stringify(slots, null, 2));
  process.exit(0);
}
check();
