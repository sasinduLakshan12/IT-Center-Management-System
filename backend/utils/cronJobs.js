const cron = require('node-cron');
const Booking = require('../models/Booking');
const PC = require('../models/PC');

const startCronJobs = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            console.log('Running auto-cancel check...');
            
            // Find bookings that are 'booked' but haven't been checked in
            // And 15 minutes have passed since their startTime
            const fifteenMinsAgo = new Date(Date.now() - 15 * 60000);

            const expiredBookings = await Booking.find({
                status: 'booked',
                startTime: { $lte: fifteenMinsAgo }
            });

            if (expiredBookings.length > 0) {
                for (let booking of expiredBookings) {
                    // Cancel the booking
                    booking.status = 'cancelled';
                    await booking.save();

                    // Free up the PC
                    const pc = await PC.findById(booking.pcId);
                    if (pc && pc.status === 'booked') {
                        pc.status = 'available';
                        await pc.save();
                    }

                    console.log(`Auto-cancelled booking ${booking._id}`);
                }
            }
        } catch (error) {
            console.error('Error in cron job:', error);
        }
    });
};

module.exports = startCronJobs;
