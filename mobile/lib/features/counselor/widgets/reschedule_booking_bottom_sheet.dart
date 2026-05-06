import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:mobile/features/counselor/providers/counselor_providers.dart';
import 'package:mobile/features/counselor/models/counselor_models.dart';

class RescheduleBookingBottomSheet extends ConsumerStatefulWidget {
  final int bookingId;
  final VoidCallback onRescheduled;
  const RescheduleBookingBottomSheet({super.key, required this.bookingId, required this.onRescheduled});

  @override
  ConsumerState<RescheduleBookingBottomSheet> createState() => _RescheduleBookingBottomSheetState();
}

class _RescheduleBookingBottomSheetState extends ConsumerState<RescheduleBookingBottomSheet> {
  int? _selectedSlotId;
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final slotsAsync = ref.watch(counselorSlotsProvider);

    return Container(
      padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).padding.bottom + 24),
      decoration: BoxDecoration(
        color: DesignSystem.overlayBackground(context),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Reschedule Session', style: GoogleFonts.plusJakartaSans(fontSize: 20, fontWeight: FontWeight.w800, color: DesignSystem.mainText(context))),
              IconButton(icon: const Icon(LucideIcons.x), onPressed: () => Navigator.pop(context)),
            ],
          ),
          const SizedBox(height: 12),
          Text('Choose a new available time slot from your schedule.', style: GoogleFonts.inter(fontSize: 14, color: DesignSystem.labelText(context))),
          const SizedBox(height: 24),

          ConstrainedBox(
            constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.4),
            child: slotsAsync.when(
              data: (slots) {
                final availableSlots = slots.where((s) => s.status == 'available').toList();
                if (availableSlots.isEmpty) {
                  return Center(child: Padding(padding: const EdgeInsets.all(20), child: Text('No available slots found. Add slots in the Schedule tab.', textAlign: TextAlign.center)));
                }
                return ListView.builder(
                  shrinkWrap: true,
                  itemCount: availableSlots.length,
                  itemBuilder: (ctx, i) => _buildSlotTile(availableSlots[i]),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (_, __) => const Center(child: Text('Error loading slots')),
            ),
          ),

          const SizedBox(height: 32),
          PrimaryButton(
            text: _isLoading ? 'Rescheduling…' : 'Confirm Reschedule',
            onPressed: (_isLoading || _selectedSlotId == null) ? null : _submit,
            isLoading: _isLoading,
          ),
        ],
      ),
    );
  }

  Widget _buildSlotTile(AvailabilitySlot slot) {
    bool isSelected = _selectedSlotId == slot.id;
    final primary = DesignSystem.primary(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GestureDetector(
        onTap: () => setState(() => _selectedSlotId = slot.id),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isSelected ? primary.withValues(alpha: 0.1) : DesignSystem.surface(context),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: isSelected ? primary : Colors.transparent, width: 2),
          ),
          child: Row(
            children: [
              Icon(LucideIcons.calendar, color: isSelected ? primary : DesignSystem.labelText(context), size: 20),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(DateFormat('EEEE, MMM d').format(slot.startTime), style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, color: DesignSystem.mainText(context))),
                    Text('${DateFormat('h:mm a').format(slot.startTime)} - ${DateFormat('h:mm a').format(slot.endTime)}', style: GoogleFonts.inter(fontSize: 12, color: DesignSystem.labelText(context))),
                  ],
                ),
              ),
              if (isSelected) Icon(LucideIcons.checkCircle, color: primary, size: 20),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (_selectedSlotId == null) return;

    setState(() => _isLoading = true);
    final ok = await ref.read(counselorAppServiceProvider).rescheduleBooking(widget.bookingId, _selectedSlotId!);
    setState(() => _isLoading = false);

    if (mounted) {
      if (ok) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Session rescheduled successfully!')));
        widget.onRescheduled();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to reschedule. Ensure the slot is still available.')));
      }
    }
  }
}
