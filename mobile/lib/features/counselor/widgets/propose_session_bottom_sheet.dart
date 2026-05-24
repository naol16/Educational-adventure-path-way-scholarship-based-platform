import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:mobile/features/counselor/providers/counselor_providers.dart';
import 'package:mobile/features/counselor/models/counselor_models.dart';
import 'package:mobile/features/mentors/models/booking_models.dart';

class ProposeSessionBottomSheet extends ConsumerStatefulWidget {
  final int studentUserId;
  final String studentName;

  const ProposeSessionBottomSheet({
    super.key,
    required this.studentUserId,
    required this.studentName,
  });

  @override
  ConsumerState<ProposeSessionBottomSheet> createState() =>
      _ProposeSessionBottomSheetState();
}

class _ProposeSessionBottomSheetState
    extends ConsumerState<ProposeSessionBottomSheet> {
  int? _selectedSlotId;
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final slotsAsync = ref.watch(counselorSlotsProvider);
    final primary = DesignSystem.primary(context);

    return Container(
      padding: EdgeInsets.fromLTRB(
          24, 16, 24, MediaQuery.of(context).padding.bottom + 24),
      decoration: BoxDecoration(
        color: DesignSystem.overlayBackground(context),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 40,
              height: 5,
              decoration: BoxDecoration(
                color: DesignSystem.labelText(context).withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Header row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Propose Session',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: DesignSystem.mainText(context),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Invite ${widget.studentName} to a session',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        color: DesignSystem.labelText(context),
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: Icon(LucideIcons.x,
                    color: DesignSystem.labelText(context)),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Student chip
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: primary.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: primary.withValues(alpha: 0.2)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(LucideIcons.user, size: 16, color: primary),
                const SizedBox(width: 8),
                Flexible(
                  child: Text(
                    widget.studentName,
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: primary,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          Text(
            'Select a time slot',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: DesignSystem.mainText(context),
            ),
          ),
          const SizedBox(height: 12),

          // Slots list
          ConstrainedBox(
            constraints: BoxConstraints(
                maxHeight: MediaQuery.of(context).size.height * 0.35),
            child: slotsAsync.when(
              data: (slots) {
                final available =
                    slots.where((s) => s.status == 'available').toList();
                if (available.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(LucideIcons.calendarX,
                              size: 40,
                              color: DesignSystem.labelText(context)),
                          const SizedBox(height: 12),
                          Text(
                            'No available slots',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: DesignSystem.mainText(context),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Add slots in the Schedule tab first.',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              color: DesignSystem.labelText(context),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }
                return ListView.builder(
                  shrinkWrap: true,
                  itemCount: available.length,
                  itemBuilder: (ctx, i) => _buildSlotTile(available[i]),
                );
              },
              loading: () => const Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 20),
                  child: CircularProgressIndicator(),
                ),
              ),
              error: (_, __) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Text(
                    'Error loading your slots',
                    style: GoogleFonts.inter(
                      color: DesignSystem.error(context),
                    ),
                  ),
                ),
              ),
            ),
          ),

          const SizedBox(height: 28),

          PrimaryButton(
            text: _isLoading ? 'Sending Invite…' : 'Send Session Invite',
            onPressed:
                (_isLoading || _selectedSlotId == null) ? null : _submit,
            isLoading: _isLoading,
          ),
        ],
      ),
    );
  }

  Widget _buildSlotTile(AvailabilitySlot slot) {
    final isSelected = _selectedSlotId == slot.id;
    final primary = DesignSystem.primary(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: GestureDetector(
        onTap: () => setState(() => _selectedSlotId = slot.id),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: isSelected
                ? primary.withValues(alpha: 0.1)
                : DesignSystem.surface(context),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected ? primary : DesignSystem.glassBorder(context),
              width: isSelected ? 2 : 1,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: isSelected
                      ? primary.withValues(alpha: 0.15)
                      : DesignSystem.surfaceMediumColor(context),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  LucideIcons.calendar,
                  color: isSelected
                      ? primary
                      : DesignSystem.labelText(context),
                  size: 18,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      DateFormat('EEEE, MMM d').format(slot.startTime),
                      style: GoogleFonts.plusJakartaSans(
                        fontWeight: FontWeight.w700,
                        color: DesignSystem.mainText(context),
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${DateFormat('h:mm a').format(slot.startTime)} – ${DateFormat('h:mm a').format(slot.endTime)}',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: DesignSystem.labelText(context),
                      ),
                    ),
                  ],
                ),
              ),
              if (isSelected)
                Icon(LucideIcons.checkCircle, color: primary, size: 22),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (_selectedSlotId == null) return;

    setState(() => _isLoading = true);
    final ok = await ref
        .read(counselorAppServiceProvider)
        .proposeSession(widget.studentUserId, _selectedSlotId!);
    setState(() => _isLoading = false);

    if (mounted) {
      if (ok) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Session invite sent to ${widget.studentName}!',
              style: const TextStyle(color: Colors.white),
            ),
            backgroundColor: DesignSystem.success(context),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text(
              'Failed to send invite. Please try again.',
              style: TextStyle(color: Colors.white),
            ),
            backgroundColor: DesignSystem.error(context),
          ),
        );
      }
    }
  }
}
