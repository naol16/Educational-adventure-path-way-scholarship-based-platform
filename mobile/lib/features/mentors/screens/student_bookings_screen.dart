import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/mentors/models/booking_models.dart';
import 'package:mobile/features/mentors/providers/mentors_providers.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/core/services/meeting_service.dart';
import 'package:mobile/features/core/widgets/pre_flight_meeting_dialog.dart';
import 'package:mobile/features/mentors/widgets/counselor_review_overlay.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:go_router/go_router.dart';

final studentBookingsProvider = FutureProvider<List<Booking>>((ref) async {
  return ref.watch(counselorServiceProvider).getMyBookings();
});

class StudentBookingsScreen extends ConsumerStatefulWidget {
  const StudentBookingsScreen({super.key});

  @override
  ConsumerState<StudentBookingsScreen> createState() => _StudentBookingsScreenState();
}

class _StudentBookingsScreenState extends ConsumerState<StudentBookingsScreen> {
  @override
  Widget build(BuildContext context) {
    final bookingsAsync = ref.watch(studentBookingsProvider);
    final primary = DesignSystem.primary(context);

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: DesignSystem.themeBackground(context),
        appBar: AppBar(
          title: Text('My Counseling Sessions', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800)),
          centerTitle: true,
          elevation: 0,
          backgroundColor: Colors.transparent,
          actions: [
            IconButton(
              icon: const Icon(LucideIcons.receipt),
              onPressed: () => context.push('/student-payment-history'),
              tooltip: 'Payment History',
            ),
            const SizedBox(width: 8),
          ],
          bottom: TabBar(
            indicatorColor: primary,
            indicatorSize: TabBarIndicatorSize.label,
            labelColor: primary,
            unselectedLabelColor: DesignSystem.labelText(context),
            labelStyle: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold),
            tabs: const [
              Tab(text: 'Ongoing'),
              Tab(text: 'Upcoming'),
              Tab(text: 'Past Sessions'),
            ],
          ),
        ),
        body: RefreshIndicator(
          onRefresh: () => ref.refresh(studentBookingsProvider.future),
          color: primary,
          child: bookingsAsync.when(
            data: (bookings) {
              final now = DateTime.now();
              final buffer = const Duration(minutes: 5);

              final ongoing = bookings.where((b) {
                if (!['confirmed', 'started'].contains(b.status)) return false;
                if (b.slot == null) return b.status == 'started';
                return (now.isAfter(b.slot!.startTime.subtract(buffer)) && 
                        now.isBefore(b.slot!.endTime)) || b.status == 'started';
              }).toList();

              final upcoming = bookings.where((b) {
                if (b.status == 'pending') return true;
                if (b.status != 'confirmed') return false;
                if (b.slot == null) return false;
                // If it's not in ongoing, it's upcoming
                return b.slot!.startTime.isAfter(now.add(buffer));
              }).toList();

              final past = bookings.where((b) {
                return ['completed', 'awaiting_confirmation'].contains(b.status) || 
                       (b.status == 'confirmed' && b.slot != null && b.slot!.endTime.isBefore(now));
              }).toList()
                ..sort((a, b) => (b.slot?.startTime ?? DateTime(0)).compareTo(a.slot?.startTime ?? DateTime(0)));

              return TabBarView(
                children: [
                  _buildBookingList(ongoing, "No sessions in progress", isOngoing: true),
                  _buildBookingList(upcoming, "No upcoming sessions"),
                  _buildBookingList(past, "No past sessions"),
                ],
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, _) => Center(child: Text("Error loading bookings", style: TextStyle(color: Colors.red))),
          ),
        ),
      ),
    );
  }

  Widget _buildBookingList(List<Booking> bookings, String emptyMsg, {bool isOngoing = false}) {
    if (bookings.isEmpty) return _buildEmptyState(context, emptyMsg);
    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: bookings.length,
      itemBuilder: (context, index) => _buildBookingCard(context, ref, bookings[index], isOngoing: isOngoing),
    );
  }

  Widget _buildEmptyState(BuildContext context, String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.calendarX, size: 64, color: DesignSystem.labelText(context).withValues(alpha: 0.5)),
          const SizedBox(height: 16),
          Text(message, style: GoogleFonts.plusJakartaSans(fontSize: 18, fontWeight: FontWeight.bold, color: DesignSystem.mainText(context))),
          const SizedBox(height: 8),
          Text("Expert guidance is just a click away.", style: GoogleFonts.inter(color: DesignSystem.labelText(context))),
        ],
      ),
    );
  }

  Widget _buildBookingCard(BuildContext context, WidgetRef ref, Booking booking, {bool isOngoing = false}) {
    final slot = booking.slot;
    final primary = DesignSystem.primary(context);
    final counselor = booking.counselor;
    final isAwaitingConfirmation = booking.status == 'awaiting_confirmation';

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Container(
        decoration: BoxDecoration(
          color: isOngoing ? Colors.red.withValues(alpha: 0.05) : DesignSystem.surface(context),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isOngoing ? Colors.red.withValues(alpha: 0.5) : (isAwaitingConfirmation ? Colors.amber.withValues(alpha: 0.5) : DesignSystem.glassBorder(context)),
            width: (isOngoing || isAwaitingConfirmation) ? 2 : 1,
          ),
          boxShadow: isOngoing 
            ? [BoxShadow(color: Colors.red.withValues(alpha: 0.1), blurRadius: 20, spreadRadius: 0)]
            : (isAwaitingConfirmation 
               ? [BoxShadow(color: Colors.amber.withValues(alpha: 0.1), blurRadius: 20, spreadRadius: 0)] 
               : null),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with status and date
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              color: isOngoing ? Colors.red.withValues(alpha: 0.1) : (isAwaitingConfirmation ? Colors.amber.withValues(alpha: 0.1) : DesignSystem.mainText(context).withValues(alpha: 0.03)),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (isOngoing)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(8)),
                      child: Text("LIVE", style: GoogleFonts.inter(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900)),
                    )
                  else
                    _buildStatusChip(context, booking.status),
                  if (slot != null)
                    Text(
                      DateFormat('EEE, MMM d').format(slot.startTime),
                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: DesignSystem.labelText(context)),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Row(
                    children: [
                      // Avatar or Icon
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          color: primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(16),
                          image: counselor?.profileImageUrl != null
                              ? DecorationImage(image: NetworkImage(counselor!.profileImageUrl!), fit: BoxFit.cover)
                              : null,
                        ),
                        child: counselor?.profileImageUrl == null
                            ? Icon(LucideIcons.user, color: primary, size: 28)
                            : null,
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              counselor?.name ?? "Academic Counselor",
                              style: GoogleFonts.plusJakartaSans(fontSize: 16, fontWeight: FontWeight.w800, color: DesignSystem.mainText(context)),
                            ),
                            if (slot != null)
                              Text(
                                "${DateFormat('jm').format(slot.startTime)} - ${DateFormat('jm').format(slot.endTime)}",
                                style: GoogleFonts.inter(fontSize: 13, color: DesignSystem.labelText(context), fontWeight: FontWeight.w500),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  if (booking.status == 'confirmed' || booking.status == 'started') ...[
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: booking.meetingLink != null ? () => _startMeeting(context, booking) : null,
                        icon: const Icon(LucideIcons.video, size: 18),
                        label: Text(isOngoing ? "JOIN SESSION NOW" : "Join Meeting"),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isOngoing ? Colors.red : primary,
                          foregroundColor: isOngoing ? Colors.white : Colors.black,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                      ),
                    ),
                  ],
                  if (isAwaitingConfirmation) ...[
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () => _showReviewBottomSheet(context, booking),
                        icon: const Icon(LucideIcons.checkCircle, size: 18),
                        label: const Text("Confirm Completion & Rate"),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.amber,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                      ),
                    ),
                  ],
                  if (booking.status == 'completed') ...[
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.1)),
                      ),
                      child: Row(
                        children: [
                          const Icon(LucideIcons.checkCircle2, color: Color(0xFF10B981), size: 16),
                          const SizedBox(width: 8),
                          Text(
                            "Milestone confirmed & Funds released",
                            style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF10B981)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChip(BuildContext context, String status) {
    Color color;
    String label = status.toUpperCase();
    
    switch (status) {
      case 'confirmed': color = const Color(0xFF10B981); break;
      case 'pending': 
        color = const Color(0xFFF59E0B); 
        label = "VERIFYING PAYMENT";
        break;
      case 'awaiting_confirmation': 
        color = Colors.amber; 
        label = "READY TO CONFIRM";
        break;
      case 'completed': color = Colors.blue; break;
      case 'cancelled': color = Colors.red; break;
      default: color = DesignSystem.labelText(context);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
      child: Text(label, style: GoogleFonts.inter(color: color, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
    );
  }

  void _startMeeting(BuildContext context, Booking booking) {
    final user = ref.read(authProvider).valueOrNull;
    if (user == null || booking.meetingLink == null) return;

    PreFlightDialog.show(context, () {
      MeetingService.joinMeeting(
        roomName: booking.meetingLink!,
        user: user,
        counselorName: booking.counselor?.name ?? 'Counselor',
        onClosed: () {
          // Provide an artificial delay before showing the review to ensure the Meeting screen fully closes
          Future.delayed(const Duration(milliseconds: 500), () {
            if (mounted) {
              _showReviewBottomSheet(context, booking);
            }
          });
        },
      );
    });
  }

  void _showReviewBottomSheet(BuildContext context, Booking booking) {
    CounselorReviewOverlay.show(
      context,
      booking,
      () => ref.refresh(studentBookingsProvider),
    );
  }
}



