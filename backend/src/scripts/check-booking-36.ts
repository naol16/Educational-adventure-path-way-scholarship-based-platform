import { Booking } from "../models/Booking.js";
import { Payment } from "../models/Payment.js";
import { sequelize } from "../config/sequelize.js";

async function checkBooking() {
  await sequelize.authenticate();
  const booking = await Booking.findByPk(36);
  if (booking) {
    console.log("BOOKING_36_STATUS:", booking.status);
    console.log("BOOKING_36_PAYMENT_ID:", booking.paymentId);
    
    if (booking.paymentId) {
      const payment = await Payment.findByPk(booking.paymentId);
      if (payment) {
        console.log("PAYMENT_STATUS:", payment.status);
        console.log("PAYMENT_ESCROW_STATUS:", payment.escrowStatus);
      } else {
        console.log("PAYMENT_NOT_FOUND");
      }
    }
  } else {
    console.log("BOOKING_36_NOT_FOUND");
  }
  process.exit(0);
}

checkBooking();
