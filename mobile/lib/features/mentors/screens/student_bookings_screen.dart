import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/mentors/models/booking_models.dart';
import 'package:mobile/features/mentors/providers/mentors_providers.dart';
import 'package:url_launcher/url_launcher.dart';

final studentBookingsProvider = FutureProvider<List<Booking>>((ref) async {
  return ref.watch(counselorServiceProvider).getMyBookings();
});

class StudentBookingsScreen extends ConsumerWidget {
  const StudentBookingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingsAsync = ref.watch(studentBookingsProvider);
    final primary = DesignSystem.primary(context);

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      appBar: AppBar(
        title: Text('My Counseling Sessions', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800)),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(studentBookingsProvider.future),
        color: primary,
        child: bookingsAsync.when(
          data: (bookings) {
            if (bookings.isEmpty) return _buildEmptyState(context);
            return ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: bookings.length,
              itemBuilder: (context, index) => _buildBookingCard(context, ref, bookings[index]),
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, _) => Center(child: Text("Error loading bookings", style: TextStyle(color: Colors.red))),
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.calendarX, size: 64, color: DesignSystem.labelText(context)),
          const SizedBox(height: 16),
          Text("No sessions booked yet", style: GoogleFonts.plusJakartaSans(fontSize: 18, fontWeight: FontWeight.bold, color: DesignSystem.mainText(context))),
          const SizedBox(height: 8),
          Text("Book your first session with an expert mentor.", style: GoogleFonts.inter(color: DesignSystem.labelText(context))),
        ],
      ),
    );
  }

  Widget _buildBookingCard(BuildContext context, WidgetRef ref, Booking booking) {
    final slot = booking.slot;
    final primary = DesignSystem.primary(context);
    final isPendingPayment = booking.status == 'pending_payment' || booking.status == 'pending'; // Adjust based on your backend statuses

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: GlassContainer(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildStatusChip(context, booking.status),
                if (slot != null)
                  Text(
                    DateFormat('MMM d, yyyy').format(slot.startTime),
                    style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: DesignSystem.labelText(context)),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(16)),
                  child: Icon(LucideIcons.video, color: primary, size: 24),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Counseling Session", style: GoogleFonts.plusJakartaSans(fontSize: 16, fontWeight: FontWeight.w800, color: DesignSystem.mainText(context))),
                      if (slot != null)
                        Text("${DateFormat('jm').format(slot.startTime)} - ${DateFormat('jm').format(slot.endTime)}", style: GoogleFonts.inter(fontSize: 13, color: DesignSystem.labelText(context))),
                    ],
                  ),
                ),
              ],
            ),
            if (booking.meetingLink != null && booking.status == 'confirmed') ...[
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _launchUrl(booking.meetingLink!),
                  icon: const Icon(LucideIcons.video, size: 18),
                  label: const Text("Join Meeting"),
                  style: ElevatedButton.styleFrom(backgroundColor: primary, foregroundColor: Colors.black, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                ),
              ),
            ],
            if (isPendingPayment) ...[
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => _verifyPayment(context, ref, booking),
                      child: const Text("Verify Payment"),
                      style: OutlinedButton.styleFrom(foregroundColor: primary, side: BorderSide(color: primary), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChip(BuildContext context, String status) {
    Color color;
    switch (status) {
      case 'confirmed': color = const Color(0xFF10B981); break;
      case 'pending': color = const Color(0xFFF59E0B); break;
      case 'completed': color = Colors.blue; break;
      case 'cancelled': color = Colors.red; break;
      default: color = DesignSystem.labelText(context);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
      child: Text(status.toUpperCase(), style: GoogleFonts.inter(color: color, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
    );
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  Future<void> _verifyPayment(BuildContext context, WidgetRef ref, Booking booking) async {
    // In a real app, tx_ref would be stored in the booking model or fetched
    // For now, let's assume we can fetch it or it's part of the booking metadata
    // I'll show a loading indicator first
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Checking payment status...")));
    
    // We'd need the tx_ref. Let's assume the backend can find it by booking ID if not provided.
    // Or we could have a specific verifyByBookingId endpoint.
    // For this demo, I'll refresh the bookings list as a "manual verification"
    await ref.refresh(studentBookingsProvider.future);
    
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Refreshed. If you paid, the status should update shortly.")));
    }
  }
}
