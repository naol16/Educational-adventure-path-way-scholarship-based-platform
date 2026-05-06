import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/counselor/providers/counselor_providers.dart';
import 'package:mobile/features/counselor/models/counselor_models.dart';
import 'package:mobile/features/counselor/screens/session_detail_screen.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/core/services/meeting_service.dart';
import 'package:mobile/features/core/widgets/pre_flight_meeting_dialog.dart';

class CounselorSessionsScreen extends ConsumerStatefulWidget {
  const CounselorSessionsScreen({super.key});

  @override
  ConsumerState<CounselorSessionsScreen> createState() => _CounselorSessionsScreenState();
}

class _CounselorSessionsScreenState extends ConsumerState<CounselorSessionsScreen> {
  int _tab = 0; // 0=ongoing 1=upcoming 2=pending 3=completed
  late PageController _pageController;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: _tab);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bookingsAsync = ref.watch(counselorUpcomingBookingsProvider);

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(context),
            const SizedBox(height: 16),
            _buildTabBar(context),
            const SizedBox(height: 16),
            Expanded(
              child: bookingsAsync.when(
                data: (bookings) {
                  return PageView.builder(
                    controller: _pageController,
                    onPageChanged: (i) => setState(() => _tab = i),
                    itemCount: 4,
                    itemBuilder: (ctx, tabIndex) {
                      final filtered = _filterForIndex(bookings, tabIndex);
                      return RefreshIndicator(
                        onRefresh: () async => ref.invalidate(counselorUpcomingBookingsProvider),
                        color: DesignSystem.primary(context),
                        child: filtered.isEmpty 
                          ? Stack(children: [ListView(), _buildEmpty(context, tabIndex)])
                          : ListView.builder(
                              physics: const AlwaysScrollableScrollPhysics(),
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                              itemCount: filtered.length,
                              itemBuilder: (ctx, i) => _buildBookingCard(context, filtered[i], tabIndex),
                            ),
                      );
                    },
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, _) => Center(child: Text('Error: $e', style: TextStyle(color: Colors.red))),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Active Sessions', style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 24, fontWeight: FontWeight.w800)),
                Text('Manage your bookings', style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 13)),
              ],
            ),
          ),
          Icon(LucideIcons.calendarCheck, color: DesignSystem.primary(context), size: 24),
        ],
      ),
    );
  }

  Widget _buildTabBar(BuildContext context) {
    final tabs = ['Ongoing', 'Upcoming', 'Pending', 'Completed'];
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Container(
        padding: const EdgeInsets.all(5),
        decoration: BoxDecoration(color: DesignSystem.surface(context), borderRadius: BorderRadius.circular(18)),
        child: Row(
          children: List.generate(tabs.length, (i) {
            final active = _tab == i;
            return Expanded(
              child: GestureDetector(
                onTap: () {
                  setState(() => _tab = i);
                  _pageController.animateToPage(i, duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  decoration: BoxDecoration(
                    color: active ? DesignSystem.primary(context) : Colors.transparent,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Center(
                    child: Text(
                      tabs[i],
                      style: GoogleFonts.inter(
                        color: active ? (Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white) : DesignSystem.labelText(context),
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ),
              ),
            );
          }),
        ),
      ),
    );
  }

  List<CounselorBooking> _filterForIndex(List<CounselorBooking> all, int index) {
    final now = DateTime.now();
    final buffer = const Duration(minutes: 5);

    switch (index) {
      case 0: // Ongoing
        return all.where((b) {
          if (!['confirmed', 'started'].contains(b.status)) return false;
          if (b.slot == null) return b.status == 'started';
          return (now.isAfter(b.slot!.startTime.subtract(buffer)) && now.isBefore(b.slot!.endTime)) || b.status == 'started';
        }).toList();
      case 1: // Upcoming
        return all.where((b) {
          if (b.status != 'confirmed') return false;
          if (b.slot == null) return false;
          return b.slot!.startTime.isAfter(now.add(buffer));
        }).toList();
      case 2: // Pending
        return all.where((b) => b.status == 'pending').toList();
      case 3: // Completed
        return all.where((b) => b.status == 'completed' || (b.status == 'confirmed' && b.slot != null && b.slot!.endTime.isBefore(now))).toList();
      default:
        return all;
    }
  }

  Widget _buildEmpty(BuildContext context, int tabIndex) {
    final labels = ['ongoing', 'upcoming', 'pending', 'completed'];
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.calendar, color: DesignSystem.labelText(context), size: 56),
          const SizedBox(height: 16),
          Text('No ${labels[tabIndex]} sessions', style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 18, fontWeight: FontWeight.w700)),
          Text("You're all clear here.", style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 13)),
        ],
      ),
    );
  }

  Widget _buildBookingCard(BuildContext context, CounselorBooking booking, int tabIndex) {
    final primary = DesignSystem.primary(context);
    final startTime = booking.slot?.startTime;

    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: GestureDetector(
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => SessionDetailScreen(booking: booking))),
        child: GlassContainer(
          padding: const EdgeInsets.all(18),
          borderRadius: 22,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: primary.withValues(alpha: 0.1),
                    backgroundImage: booking.student?.avatarUrl != null ? NetworkImage(booking.student!.avatarUrl!) : null,
                    child: booking.student?.avatarUrl == null ? Icon(LucideIcons.user, color: primary, size: 24) : null,
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(booking.student?.name ?? 'Unknown Student', style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontWeight: FontWeight.w700, fontSize: 15)),
                        if (startTime != null)
                          Text(DateFormat('MMM d • h:mm a').format(startTime), style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 11)),
                      ],
                    ),
                  ),
                  _buildStatusBadge(context, booking.status, isOngoing: tabIndex == 0),
                ],
              ),
              if (tabIndex == 0) ...[
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: booking.meetingLink != null ? () => _startMeeting(context, booking) : null,
                    icon: const Icon(LucideIcons.video, size: 16),
                    label: const Text("JOIN SESSION NOW"),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Tap for details', style: GoogleFonts.inter(color: primary, fontSize: 11, fontWeight: FontWeight.w600)),
                  Icon(LucideIcons.chevronRight, size: 16, color: primary),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(BuildContext context, String status, {bool isOngoing = false}) {
    if (isOngoing) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
        child: Text("LIVE", style: GoogleFonts.inter(color: Colors.red, fontSize: 10, fontWeight: FontWeight.w900)),
      );
    }
    Color color;
    String label;
    switch (status) {
      case 'confirmed': color = const Color(0xFF10B981); label = 'Confirmed'; break;
      case 'pending':   color = const Color(0xFFF59E0B); label = 'Pending'; break;
      case 'completed': color = Colors.blue; label = 'Done'; break;
      case 'cancelled': color = Colors.red; label = 'Cancelled'; break;
      default:          color = DesignSystem.labelText(context); label = status;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
      child: Text(label, style: GoogleFonts.inter(color: color, fontSize: 10, fontWeight: FontWeight.w700)),
    );
  }

  void _startMeeting(BuildContext context, CounselorBooking booking) {
    final user = ref.read(authProvider).valueOrNull;
    if (user == null || booking.meetingLink == null) return;

    PreFlightDialog.show(context, () {
      MeetingService.joinMeeting(
        roomName: booking.meetingLink!,
        user: user,
        counselorName: user.name,
        onClosed: () {
          // Refresh list when they close the meeting
          ref.invalidate(counselorUpcomingBookingsProvider);
        },
      );
    });
  }
}
