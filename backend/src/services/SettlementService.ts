import { Op } from 'sequelize';
import { Booking } from '../models/Booking.js';
import { Student } from '../models/Student.js';
import { CounselorService } from '../services/CounselorService.js';
import { sequelize } from '../config/sequelize.js';
import { Transaction } from 'sequelize';

export class SettlementService {
    /**
     * Automatically releases funds for bookings that were completed more than 7 days ago
     * but haven't been confirmed or disputed by the student.
     */
    static async autoReleaseEscrow() {
        console.log('[SettlementService] Starting auto-release of escrowed funds...');
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        try {
            // Find bookings that are 'completed' (session happened) 
            // but still 'held' (funds not released)
            // and the session date is older than 7 days
            const stagnantBookings = await Booking.findAll({
                where: {
                    status: 'completed',
                    paymentStatus: 'held',
                    appointmentDate: {
                        [Op.lt]: sevenDaysAgo
                    }
                }
            });

            console.log(`[SettlementService] Found ${stagnantBookings.length} bookings for auto-release.`);

            for (const booking of stagnantBookings) {
                try {
                    await sequelize.transaction(async (t: Transaction) => {
                        console.log(`[SettlementService] Processing auto-release for Booking #${booking.id}`);
                        
                        const student = await Student.findByPk(booking.studentId);
                        if (!student) throw new Error(`Student not found for booking ${booking.id}`);

                        // We reuse the logic from CounselorService to ensure consistency in ledger updates
                        await CounselorService.reviewAndConfirmBooking(
                            student.userId,
                            booking.id,
                            {
                                rating: 5,
                                comment: "Automatically released after 7 days of inactivity."
                            }
                        );
                    });
                } catch (innerError) {
                    console.error(`[SettlementService] Failed to auto-release Booking #${booking.id}:`, innerError);
                }
            }

            return stagnantBookings.length;
        } catch (error) {
            console.error('[SettlementService] Error during auto-release cron:', error);
            throw error;
        }
    }
}
