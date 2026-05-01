import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/mentors/models/booking_models.dart';
import 'package:mobile/features/mentors/screens/student_bookings_screen.dart';

class StudentPaymentHistoryScreen extends ConsumerWidget {
  const StudentPaymentHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingsAsync = ref.watch(studentBookingsProvider);
    final primary = DesignSystem.primary(context);

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      appBar: AppBar(
        title: Text('Payment History', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800)),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(studentBookingsProvider.future),
        color: primary,
        child: bookingsAsync.when(
          data: (bookings) {
            // Filter bookings that had a payment attempt (anything not 'pending' or include 'pending' if it's 'verifying payment')
            // In this context, everything in the list except 'cancelled' (maybe) is a payment record.
            final payments = bookings.where((b) => b.status != 'cancelled').toList()
              ..sort((a, b) => b.createdAt.compareTo(a.createdAt));

            if (payments.isEmpty) {
              return _buildEmptyState(context);
            }

            return ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: payments.length,
              itemBuilder: (context, index) => _buildPaymentCard(context, payments[index]),
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, _) => const Center(child: Text("Error loading payment history")),
        ),
      ),
    );
  }

  Widget _buildPaymentCard(BuildContext context, Booking booking) {
    final isSuccess = ['confirmed', 'started', 'completed', 'awaiting_confirmation'].contains(booking.status);
    final isPending = booking.status == 'pending';
    final color = isSuccess ? const Color(0xFF10B981) : (isPending ? Colors.amber : Colors.red);
    final statusText = isSuccess ? "SUCCESS" : (isPending ? "PENDING" : "FAILED");
    
    // Assuming each booking is 1 hour and uses counselor's rate. 
    // In a real app, the amount would come from the Payment object.
    // For now, we show "Session Payment" and the status.
    
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GlassContainer(
        padding: const EdgeInsets.all(16),
        borderRadius: 24,
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                isSuccess ? LucideIcons.check : (isPending ? LucideIcons.clock : LucideIcons.x),
                color: color,
                size: 20,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    booking.counselor?.name ?? "Counseling Session",
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: DesignSystem.mainText(context),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    DateFormat('MMM d, yyyy • h:mm a').format(booking.createdAt),
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: DesignSystem.labelText(context),
                    ),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  statusText,
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    color: color,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  booking.payment != null 
                    ? "${booking.payment!.amount.toStringAsFixed(0)} ${booking.payment!.currency}"
                    : "Processed",
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: DesignSystem.mainText(context).withValues(alpha: 0.7),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.receipt, size: 64, color: DesignSystem.labelText(context).withValues(alpha: 0.3)),
          const SizedBox(height: 16),
          Text(
            "No payment history",
            style: GoogleFonts.plusJakartaSans(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: DesignSystem.mainText(context),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            "Your session payments will appear here.",
            style: GoogleFonts.inter(color: DesignSystem.labelText(context)),
          ),
        ],
      ),
    );
  }
}
