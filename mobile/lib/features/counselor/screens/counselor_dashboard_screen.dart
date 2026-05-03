import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/counselor/providers/counselor_providers.dart';
import 'package:mobile/features/counselor/models/counselor_models.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/core/widgets/notification_bell.dart';
import 'package:mobile/features/core/services/meeting_service.dart';
import 'package:mobile/features/core/widgets/pre_flight_meeting_dialog.dart';
import 'package:go_router/go_router.dart';

class CounselorDashboardScreen extends ConsumerWidget {
  const CounselorDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final overviewAsync = ref.watch(counselorDashboardProvider);
    final profileAsync = ref.watch(counselorProfileProvider);
    final bookingsAsync = ref.watch(counselorUpcomingBookingsProvider);

    return profileAsync.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(body: Center(child: Text('Error: $e'))),
      data: (profile) {
        if (profile?.verificationStatus == 'pending') return _buildPendingScreen(context, ref);
        if (profile?.verificationStatus == 'rejected') return _buildRejectedScreen(context);

        return Scaffold(
          backgroundColor: DesignSystem.themeBackground(context),
          body: Stack(
            children: [
              Positioned(top: -60, right: -60, child: DesignSystem.buildBlurCircle(DesignSystem.primary(context).withValues(alpha: 0.06), 250)),
              Positioned(bottom: 100, left: -80, child: DesignSystem.buildBlurCircle(const Color(0xFF10B981).withValues(alpha: 0.04), 200)),
              SafeArea(
                child: RefreshIndicator(
                  onRefresh: () async {
                    ref.invalidate(counselorDashboardProvider);
                    ref.invalidate(counselorProfileProvider);
                    ref.invalidate(counselorUpcomingBookingsProvider);
                  },
                  color: DesignSystem.primary(context),
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildHeader(context, profileAsync),
                        const SizedBox(height: 24),
                        _buildStatsRow(context, overviewAsync),
                        const SizedBox(height: 24),
                        _buildEarningsCard(context, profileAsync),
                        const SizedBox(height: 24),
                        _buildUpcomingSessions(context, ref, bookingsAsync),
                        const SizedBox(height: 24),
                        _buildProInsight(context),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildHeader(BuildContext context, AsyncValue<CounselorProfile?> profileAsync) {
    final profile = profileAsync.valueOrNull;
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Good ${_greeting()}, 👋',
                style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 13),
              ),
              const SizedBox(height: 2),
              Text(
                profile?.name ?? 'Counselor',
                style: GoogleFonts.plusJakartaSans(
                  color: DesignSystem.mainText(context),
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                ),
              ),
              if (profile != null) ...[
                const SizedBox(height: 4),
                _buildVerificationBadge(context, profile.verificationStatus),
              ],
            ],
          ),
        ),
        const NotificationBell(),
        const SizedBox(width: 8),
        GestureDetector(
          onTap: () => context.push('/counselor-profile'),
          child: CircleAvatar(
            radius: 28,
            backgroundColor: DesignSystem.surfaceMediumColor(context),
            backgroundImage: profile?.profileImageUrl != null ? NetworkImage(profile!.profileImageUrl!) : null,
            child: profile?.profileImageUrl == null
                ? Icon(LucideIcons.user, color: DesignSystem.labelText(context), size: 24)
                : null,
          ),
        ),
      ],
    );
  }

  Widget _buildVerificationBadge(BuildContext context, String status) {
    Color color;
    IconData icon;
    String label;
    switch (status) {
      case 'verified':
        color = const Color(0xFF10B981);
        icon = Icons.verified;
        label = 'Verified Expert';
        break;
      case 'rejected':
        color = Colors.red;
        icon = LucideIcons.alertCircle;
        label = 'Application Rejected';
        break;
      default:
        color = const Color(0xFFF59E0B);
        icon = LucideIcons.clock;
        label = 'Pending Approval';
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 11),
          const SizedBox(width: 4),
          Text(label, style: GoogleFonts.inter(color: color, fontSize: 10, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }

  Widget _buildStatsRow(BuildContext context, AsyncValue<CounselorDashboardOverview?> overviewAsync) {
    final overview = overviewAsync.valueOrNull;
    return Row(
      children: [
        _buildStatCard(context, '${overview?.assignedStudents ?? 0}', 'Students', LucideIcons.users, const Color(0xFF10B981)),
        const SizedBox(width: 10),
        _buildStatCard(context, '${overview?.upcomingBookings ?? 0}', 'Upcoming', LucideIcons.calendarCheck, DesignSystem.primary(context)),
        const SizedBox(width: 10),
        _buildStatCard(context, '${overview?.completedSessions ?? 0}', 'Done', LucideIcons.checkCircle, const Color(0xFF06B6D4)),
        const SizedBox(width: 10),
        _buildStatCard(context, '${overview?.pendingBookings ?? 0}', 'Pending', LucideIcons.clock, const Color(0xFFF59E0B)),
      ],
    );
  }

  Widget _buildStatCard(BuildContext context, String value, String label, IconData icon, Color color) {
    return Expanded(
      child: GlassContainer(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        borderRadius: 20,
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: color.withValues(alpha: 0.15), shape: BoxShape.circle),
              child: Icon(icon, color: color, size: 18),
            ),
            const SizedBox(height: 8),
            Text(value, style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 20, fontWeight: FontWeight.w800)),
            Text(label, style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 10, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  Widget _buildEarningsCard(BuildContext context, AsyncValue<CounselorProfile?> profileAsync) {
    final profile = profileAsync.valueOrNull;
    return GestureDetector(
      onTap: () => context.push('/counselor-wallet'),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [const Color(0xFF0F2027), const Color(0xFF203A43), const Color(0xFF2C5364)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 8))],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: const Color(0xFF10B981).withValues(alpha: 0.2), borderRadius: BorderRadius.circular(16)),
              child: const Icon(LucideIcons.wallet, color: Color(0xFF10B981), size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Available Balance', style: GoogleFonts.inter(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 0.5)),
                  const SizedBox(height: 2),
                  Text(
                    '${NumberFormat('#,##0').format(profile?.pendingBalance ?? 0)} ETB',
                    style: GoogleFonts.plusJakartaSans(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800),
                  ),
                  Text(
                    'Lifetime: ${NumberFormat('#,##0').format(profile?.totalEarned ?? 0)} ETB',
                    style: GoogleFonts.inter(color: Colors.white38, fontSize: 11),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(color: const Color(0xFF10B981), borderRadius: BorderRadius.circular(14)),
              child: Text('Withdraw', style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w800)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUpcomingSessions(BuildContext context, WidgetRef ref, AsyncValue<List<CounselorBooking>> bookingsAsync) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Upcoming Sessions', style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 18, fontWeight: FontWeight.w800)),
            Text('View All', style: GoogleFonts.inter(color: DesignSystem.primary(context), fontSize: 12, fontWeight: FontWeight.w700)),
          ],
        ),
        const SizedBox(height: 12),
        bookingsAsync.when(
          data: (bookings) {
            if (bookings.isEmpty) {
              return GlassContainer(
                padding: const EdgeInsets.all(24),
                borderRadius: 20,
                child: Center(
                  child: Column(
                    children: [
                      Icon(LucideIcons.calendarOff, color: DesignSystem.labelText(context), size: 40),
                      const SizedBox(height: 12),
                      Text('No upcoming sessions', style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 14, fontWeight: FontWeight.w600)),
                      Text('Your schedule is clear', style: GoogleFonts.inter(color: DesignSystem.labelText(context).withValues(alpha: 0.6), fontSize: 12)),
                    ],
                  ),
                ),
              );
            }
            return Column(
              children: bookings.take(3).map((b) => _buildSessionCard(context, ref, b)).toList(),
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, s) => const SizedBox.shrink(),
        ),
      ],
    );
  }

  Widget _buildSessionCard(BuildContext context, WidgetRef ref, CounselorBooking booking) {
    final slot = booking.slot;
    final startTime = slot?.startTime;
    final primary = DesignSystem.primary(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GlassContainer(
        padding: const EdgeInsets.all(16),
        borderRadius: 20,
        child: Row(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(color: primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(14)),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    startTime != null ? DateFormat('d').format(startTime) : '--',
                    style: GoogleFonts.plusJakartaSans(color: primary, fontSize: 18, fontWeight: FontWeight.w800),
                  ),
                  Text(
                    startTime != null ? DateFormat('MMM').format(startTime).toUpperCase() : '---',
                    style: GoogleFonts.inter(color: primary, fontSize: 9, fontWeight: FontWeight.w700),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    booking.student?.name ?? 'Student Session',
                    style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 14, fontWeight: FontWeight.w700),
                  ),
                  Text(
                    startTime != null ? DateFormat('EEEE, jm').format(startTime) : 'Time TBD',
                    style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 12),
                  ),
                  const SizedBox(height: 4),
                  _buildStatusBadge(context, booking.status),
                ],
              ),
            ),
            if (booking.meetingLink != null)
              GestureDetector(
                onTap: () {
                  final user = ref.read(authProvider).valueOrNull;
                  if (user == null) return;
                  PreFlightDialog.show(context, () {
                    MeetingService.joinMeeting(
                      roomName: booking.meetingLink!,
                      user: user,
                      counselorName: user.name,
                      onClosed: () {
                        ref.invalidate(counselorUpcomingBookingsProvider);
                      },
                    );
                  });
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(color: primary, borderRadius: BorderRadius.circular(12)),
                  child: Text('Join', style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w800)),
                ),
              ),
          ],
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
      case 'completed': color = DesignSystem.primary(context); label = 'Completed'; break;
      default:          color = DesignSystem.labelText(context); label = status;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
      child: Text(label, style: GoogleFonts.inter(color: color, fontSize: 10, fontWeight: FontWeight.w700)),
    );
  }

  Widget _buildProInsight(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: DesignSystem.primary(context).withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: DesignSystem.primary(context).withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: DesignSystem.primary(context), borderRadius: BorderRadius.circular(10)),
            child: const Icon(LucideIcons.trendingUp, color: Colors.white, size: 18),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Pro Insight', style: GoogleFonts.plusJakartaSans(color: DesignSystem.primary(context), fontSize: 12, fontWeight: FontWeight.w800)),
                const SizedBox(height: 2),
                Text(
                  'Reviewing student drafts 48h before deadlines increases successful matching by 72%.',
                  style: GoogleFonts.inter(color: DesignSystem.subText(context), fontSize: 12, height: 1.5),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPendingScreen(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: GlassContainer(
            padding: const EdgeInsets.all(32),
            borderRadius: 32,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(color: Colors.orange.withValues(alpha: 0.1), shape: BoxShape.circle),
                  child: const Icon(LucideIcons.clock, color: Colors.orange, size: 48),
                ),
                const SizedBox(height: 24),
                Text('Verification Pending', style: GoogleFonts.plusJakartaSans(fontSize: 24, fontWeight: FontWeight.w800, color: DesignSystem.mainText(context))),
                const SizedBox(height: 12),
                Text(
                  'Our team is currently reviewing your profile. This usually takes 24-48 hours. We\'ll notify you once approved.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 14, height: 1.5),
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      ref.invalidate(counselorProfileProvider);
                      ref.invalidate(counselorDashboardProvider);
                    },
                    icon: const Icon(LucideIcons.refreshCw, size: 18),
                    style: ElevatedButton.styleFrom(backgroundColor: DesignSystem.primary(context), foregroundColor: Colors.black, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)), padding: const EdgeInsets.symmetric(vertical: 16)),
                    label: const Text('Refresh Status', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: TextButton.icon(
                    onPressed: () => ref.read(authProvider.notifier).logout(),
                    icon: const Icon(LucideIcons.logOut, size: 18, color: Colors.red),
                    label: const Text('Log Out', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRejectedScreen(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: GlassContainer(
            padding: const EdgeInsets.all(32),
            borderRadius: 32,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.1), shape: BoxShape.circle),
                  child: const Icon(LucideIcons.alertCircle, color: Colors.red, size: 48),
                ),
                const SizedBox(height: 24),
                Text('Application Rejected', style: GoogleFonts.plusJakartaSans(fontSize: 24, fontWeight: FontWeight.w800, color: DesignSystem.mainText(context))),
                const SizedBox(height: 12),
                Text(
                  'Unfortunately, your counselor application was not approved. Please contact support for more information.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 14, height: 1.5),
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.grey.shade800, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)), padding: const EdgeInsets.symmetric(vertical: 16)),
                    child: const Text('Contact Support', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }
}
