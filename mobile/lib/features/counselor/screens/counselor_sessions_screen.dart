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

class CounselorSessionsScreen extends ConsumerStatefulWidget {
  const CounselorSessionsScreen({super.key});

  @override
  ConsumerState<CounselorSessionsScreen> createState() => _CounselorSessionsScreenState();
}

class _CounselorSessionsScreenState extends ConsumerState<CounselorSessionsScreen> {
  int _tab = 0; // 0=upcoming 1=pending 2=completed

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
              child: RefreshIndicator(
                onRefresh: () async => ref.invalidate(counselorUpcomingBookingsProvider),
                color: DesignSystem.primary(context),
                child: bookingsAsync.when(
                  data: (bookings) {
                    final filtered = _filterBookings(bookings);
                    if (filtered.isEmpty) return _buildEmpty(context);
                    return ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      itemCount: filtered.length,
                      itemBuilder: (ctx, i) => _buildBookingCard(context, filtered[i]),
                    );
                  },
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (e, _) => Center(child: Text('Error: $e', style: TextStyle(color: Colors.red))),
                ),
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
    final tabs = ['Upcoming', 'Pending', 'Completed'];
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
                onTap: () => setState(() => _tab = i),
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

  List<CounselorBooking> _filterBookings(List<CounselorBooking> all) {
    switch (_tab) {
      case 0: return all.where((b) => b.status == 'confirmed').toList();
      case 1: return all.where((b) => b.status == 'pending').toList();
      case 2: return all.where((b) => b.status == 'completed').toList();
      default: return all;
    }
  }

  Widget _buildEmpty(BuildContext context) {
    final labels = ['upcoming', 'pending', 'completed'];
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.calendar, color: DesignSystem.labelText(context), size: 56),
          const SizedBox(height: 16),
          Text('No ${labels[_tab]} sessions', style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 18, fontWeight: FontWeight.w700)),
          Text("You're all clear here.", style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 13)),
        ],
      ),
    );
  }

  Widget _buildBookingCard(BuildContext context, CounselorBooking booking) {
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
                  _buildStatusBadge(context, booking.status),
                ],
              ),
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

  Widget _buildStatusBadge(BuildContext context, String status) {
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
}
