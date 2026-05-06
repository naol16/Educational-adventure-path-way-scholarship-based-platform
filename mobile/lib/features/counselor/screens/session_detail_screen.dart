import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/counselor/providers/counselor_providers.dart';
import 'package:mobile/features/counselor/models/counselor_models.dart';
import 'package:mobile/features/counselor/screens/student_progress_detail_screen.dart';
import 'package:mobile/features/counselor/widgets/reschedule_booking_bottom_sheet.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/core/services/meeting_service.dart';
import 'package:mobile/features/core/widgets/pre_flight_meeting_dialog.dart';

class SessionDetailScreen extends ConsumerStatefulWidget {
  final CounselorBooking booking;
  const SessionDetailScreen({super.key, required this.booking});

  @override
  ConsumerState<SessionDetailScreen> createState() => _SessionDetailScreenState();
}

class _SessionDetailScreenState extends ConsumerState<SessionDetailScreen> {
  bool _isUpdating = false;

  @override
  Widget build(BuildContext context) {
    final booking = widget.booking;
    final isPending = booking.status == 'pending';

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      appBar: AppBar(
        title: Text('Session Details', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800)),
        centerTitle: true,
        actions: [
          if (booking.status == 'confirmed' || booking.status == 'pending')
            IconButton(
              icon: const Icon(LucideIcons.calendar),
              onPressed: () => _showRescheduleSheet(context),
              tooltip: 'Reschedule',
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildStatusHeader(context, booking),
                if (booking.status != 'cancelled' && booking.status != 'completed')
                  TextButton.icon(
                    onPressed: () => _showNotesDialog(context),
                    icon: const Icon(LucideIcons.edit3, size: 16),
                    label: const Text('Edit Notes'),
                  ),
              ],
            ),
            const SizedBox(height: 24),
            _buildStudentCard(context, booking.student),
            const SizedBox(height: 24),
            _buildTimeCard(context, booking),
            const SizedBox(height: 24),
            if (booking.notes != null && booking.notes!.isNotEmpty) _buildNotesCard(context, booking.notes!),
            const SizedBox(height: 32),
            if (booking.status == 'confirmed') _buildJoinButton(context, booking),
            if (isPending) _buildPendingActions(context, booking),
            const SizedBox(height: 16),
            if (booking.status != 'cancelled' && booking.status != 'completed') 
              _buildCancelButton(context, booking),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusHeader(BuildContext context, CounselorBooking booking) {
    Color statusColor;
    IconData statusIcon;
    String label = booking.status.toUpperCase();

    switch (booking.status) {
      case 'confirmed': statusColor = const Color(0xFF10B981); statusIcon = LucideIcons.checkCircle; break;
      case 'started': statusColor = DesignSystem.primary(context); statusIcon = LucideIcons.video; break;
      case 'awaiting_confirmation': 
        statusColor = const Color(0xFFF59E0B); 
        statusIcon = LucideIcons.clock; 
        label = "WAITING FOR STUDENT";
        break;
      case 'completed': statusColor = Colors.blue; statusIcon = LucideIcons.checkSquare; break;
      case 'cancelled': statusColor = Colors.red; statusIcon = LucideIcons.xCircle; break;
      default: statusColor = const Color(0xFFF59E0B); statusIcon = LucideIcons.clock;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: statusColor.withValues(alpha: 0.3))),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(statusIcon, color: statusColor, size: 18),
          const SizedBox(width: 8),
          Text(label, style: GoogleFonts.plusJakartaSans(color: statusColor, fontSize: 13, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
        ],
      ),
    );
  }

  Widget _buildStudentCard(BuildContext context, StudentSummary? student) {
    if (student == null) return const SizedBox();
    return GestureDetector(
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => StudentProgressDetailScreen(student: student))),
      child: GlassContainer(
        padding: const EdgeInsets.all(20),
        borderRadius: 24,
        child: Row(
          children: [
            CircleAvatar(
              radius: 30,
              backgroundColor: DesignSystem.primary(context).withValues(alpha: 0.1),
              backgroundImage: student.avatarUrl != null ? NetworkImage(student.avatarUrl!) : null,
              child: student.avatarUrl == null ? Icon(LucideIcons.user, color: DesignSystem.primary(context), size: 30) : null,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(student.name, style: GoogleFonts.plusJakartaSans(fontSize: 18, fontWeight: FontWeight.w800, color: DesignSystem.mainText(context))),
                  Text(student.email, style: GoogleFonts.inter(fontSize: 13, color: DesignSystem.labelText(context))),
                  const SizedBox(height: 4),
                  Text('View Student Profile →', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: DesignSystem.primary(context))),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeCard(BuildContext context, CounselorBooking booking) {
    final slot = booking.slot;
    if (slot == null) return const SizedBox();
    return GlassContainer(
      padding: const EdgeInsets.all(20),
      borderRadius: 24,
      child: Column(
        children: [
          _timeRow(context, LucideIcons.calendar, 'Date', DateFormat('EEEE, MMM d, yyyy').format(slot.startTime)),
          const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Divider(height: 1, color: Colors.white10)),
          _timeRow(context, LucideIcons.clock, 'Time', '${DateFormat('h:mm a').format(slot.startTime)} - ${DateFormat('h:mm a').format(slot.endTime)}'),
        ],
      ),
    );
  }

  Widget _timeRow(BuildContext context, IconData icon, String label, String value) {
    return Row(
      children: [
        Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: DesignSystem.surface(context), borderRadius: BorderRadius.circular(12)), child: Icon(icon, size: 20, color: DesignSystem.primary(context))),
        const SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: DesignSystem.labelText(context))),
            Text(value, style: GoogleFonts.plusJakartaSans(fontSize: 15, fontWeight: FontWeight.w700, color: DesignSystem.mainText(context))),
          ],
        ),
      ],
    );
  }

  Widget _buildNotesCard(BuildContext context, String notes) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text('Student Notes', style: GoogleFonts.plusJakartaSans(fontSize: 15, fontWeight: FontWeight.w800, color: DesignSystem.mainText(context))),
        ),
        GlassContainer(
          padding: const EdgeInsets.all(20),
          borderRadius: 24,
          child: Text(notes, style: GoogleFonts.inter(fontSize: 14, color: DesignSystem.subText(context), height: 1.6)),
        ),
      ],
    );
  }

  Widget _buildJoinButton(BuildContext context, CounselorBooking booking) {
    final isStarted = booking.status == 'started';
    return Column(
      children: [
        if (booking.status == 'confirmed') ...[
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(backgroundColor: DesignSystem.primary(context), foregroundColor: Colors.black, padding: const EdgeInsets.all(20), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)), elevation: 0),
              onPressed: _isUpdating ? null : () => _updateStatus('started'),
              icon: const Icon(LucideIcons.play),
              label: Text('START SESSION', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800, fontSize: 16)),
            ),
          ),
          const SizedBox(height: 12),
        ],
        if (isStarted) ...[
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), foregroundColor: Colors.white, padding: const EdgeInsets.all(20), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)), elevation: 0),
              onPressed: _isUpdating ? null : () => _updateStatus('awaiting_confirmation'),
              icon: const Icon(LucideIcons.checkCircle),
              label: Text('MARK AS COMPLETED', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800, fontSize: 16)),
            ),
          ),
          const SizedBox(height: 12),
        ],
        if (booking.status == 'confirmed' || isStarted)
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(foregroundColor: DesignSystem.primary(context), side: BorderSide(color: DesignSystem.primary(context)), padding: const EdgeInsets.all(18), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18))),
              onPressed: () => _joinMeeting(booking),
              icon: const Icon(LucideIcons.video),
              label: Text(isStarted ? 'RE-JOIN MEETING' : 'JOIN MEETING', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800, fontSize: 16)),
            ),
          ),
        if (booking.status == 'awaiting_confirmation')
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: const Color(0xFFF59E0B).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.2))),
            child: Row(
              children: [
                const Icon(LucideIcons.info, color: Color(0xFFF59E0B), size: 20),
                const SizedBox(width: 12),
                Expanded(child: Text('Waiting for student to confirm and rate the session. Funds will be released once confirmed.', style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFFF59E0B), fontWeight: FontWeight.w600))),
              ],
            ),
          ),
      ],
    );
  }


  Widget _buildPendingActions(BuildContext context, CounselorBooking booking) {
    return Row(
      children: [
        Expanded(
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), foregroundColor: Colors.white, padding: const EdgeInsets.all(16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)), elevation: 0),
            onPressed: _isUpdating ? null : () => _updateStatus('confirmed'),
            child: _isUpdating ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : Text('Accept', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800)),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: OutlinedButton(
            style: OutlinedButton.styleFrom(foregroundColor: Colors.red, side: const BorderSide(color: Colors.red), padding: const EdgeInsets.all(16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))),
            onPressed: _isUpdating ? null : () => _updateStatus('cancelled'),
            child: Text('Decline', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800)),
          ),
        ),
      ],
    );
  }

  Widget _buildCancelButton(BuildContext context, CounselorBooking booking) {
    return Center(
      child: TextButton.icon(
        onPressed: _isUpdating ? null : () => _confirmCancel(),
        icon: const Icon(LucideIcons.trash2, size: 18, color: Colors.red),
        label: Text('Cancel Booking', style: GoogleFonts.inter(color: Colors.red, fontWeight: FontWeight.w700)),
      ),
    );
  }

  Future<void> _updateStatus(String status) async {
    setState(() => _isUpdating = true);
    final ok = await ref.read(counselorAppServiceProvider).updateBookingStatus(widget.booking.id, status);
    setState(() => _isUpdating = false);
    if (ok) {
      ref.invalidate(counselorUpcomingBookingsProvider);
      if (mounted) Navigator.pop(context);
    }
  }

  Future<void> _confirmCancel() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cancel Booking?'),
        content: const Text('Are you sure you want to cancel this session? This action cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('No, Keep')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Yes, Cancel', style: TextStyle(color: Colors.red))),
        ],
      ),
    );
    if (confirm == true) _updateStatus('cancelled');
  }

  void _joinMeeting(CounselorBooking booking) {
    final user = ref.read(authProvider).valueOrNull;
    if (user == null) return;

    final roomName = booking.meetingLink;
    if (roomName == null || roomName.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Meeting room not available yet.')),
      );
      return;
    }

    PreFlightDialog.show(context, () {
      MeetingService.joinMeeting(
        roomName: roomName,
        user: user,
        counselorName: user.name,
        onClosed: () {
          ref.invalidate(counselorUpcomingBookingsProvider);
          if (mounted) Navigator.pop(context);
        },
      );
    });
  }

  void _showRescheduleSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => RescheduleBookingBottomSheet(
        bookingId: widget.booking.id,
        onRescheduled: () {
          ref.invalidate(counselorUpcomingBookingsProvider);
          Navigator.pop(context); // Go back to sessions list
        },
      ),
    );
  }

  void _showNotesDialog(BuildContext context) {
    final controller = TextEditingController(text: widget.booking.notes);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Update Session Notes'),
        content: TextField(
          controller: controller,
          maxLines: 5,
          decoration: const InputDecoration(hintText: 'Add private notes or student feedback...', border: OutlineInputBorder()),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              final ok = await ref.read(counselorAppServiceProvider).updateBookingNotes(widget.booking.id, controller.text);
              if (ok) {
                ref.invalidate(counselorUpcomingBookingsProvider);
                if (mounted) Navigator.pop(ctx);
                if (mounted) Navigator.pop(context); // Refresh by going back
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }
}
