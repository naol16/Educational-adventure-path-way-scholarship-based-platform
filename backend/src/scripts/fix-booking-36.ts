import { Booking } from "../models/Booking.js";
import { Payment } from "../models/Payment.js";
import { sequelize } from "../config/sequelize.js";

async function fixBooking() {
  await sequelize.authenticate();
  const booking = await Booking.findByPk(36);
  if (booking && booking.paymentId) {
    const payment = await Payment.findByPk(booking.paymentId);
    if (payment) {
      await payment.update({ status: 'success', escrowStatus: 'held' });
      console.log("FIXED_PAYMENT_STATUS_FOR_BOOKING_36");
    }
  }
  process.exit(0);
}

fixBooking();
