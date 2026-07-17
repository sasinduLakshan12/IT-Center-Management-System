const cron = require('node-cron');
const Booking = require('../models/Booking');
const Computer = require('../models/Computer');
const { autoAssignFromWaitingList } = require('../controllers/bookingController');

const startCronJobs = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            // Find bookings that are 'Confirmed' but haven't been checked in
            // And 15 minutes have passed since their startTime slot.
            const now = new Date();
            const today = new Date();
            today.setHours(0,0,0,0);

            // We need to fetch confirmed bookings for today, and check their time slots
            const pendingBookings = await Booking.find({
                status: 'Confirmed',
                bookingDate: today
            }).populate('timeSlot');

            for (let booking of pendingBookings) {
                if (!booking.timeSlot) continue;

                const [startHour, startMinute] = booking.timeSlot.startTime.split(':').map(Number);
                const slotStartTime = new Date(today);
                slotStartTime.setHours(startHour, startMinute, 0, 0);

                // If 15 mins have passed since the slot started, and they still haven't checked in
                const noShowLimit = new Date(slotStartTime.getTime() + 15 * 60000);

                if (now > noShowLimit) {
                    booking.status = 'Missed';
                    booking.cancellationReason = 'Auto-cancelled due to No-Show (15 minutes late)';
                    await booking.save();

                    console.log(`Auto-cancelled booking ${booking.referenceNumber} due to No-Show.`);

                    // Trigger auto-assign from waiting list
                    await autoAssignFromWaitingList(booking.bookingDate, booking.timeSlot._id);
                }
            }

        } catch (error) {
            console.error('Error in cron job:', error);
        }
    });
};

module.exports = startCronJobs;
