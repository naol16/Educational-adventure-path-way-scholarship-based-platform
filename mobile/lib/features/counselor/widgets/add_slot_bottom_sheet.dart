import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:mobile/features/counselor/providers/counselor_providers.dart';

class AddSlotBottomSheet extends ConsumerStatefulWidget {
  final VoidCallback onAdded;
  const AddSlotBottomSheet({super.key, required this.onAdded});

  @override
  ConsumerState<AddSlotBottomSheet> createState() => _AddSlotBottomSheetState();
}

class _AddSlotBottomSheetState extends ConsumerState<AddSlotBottomSheet> {
  String _selectedDay = 'Monday';
  TimeOfDay _startTime = const TimeOfDay(hour: 9, minute: 0);
  TimeOfDay _endTime = const TimeOfDay(hour: 10, minute: 0);
  bool _isSubmitting = false;

  static const _days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  @override
  Widget build(BuildContext context) {
    final primary = DesignSystem.primary(context);
    return Container(
      padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
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
              Text('Add Availability Slot', style: GoogleFonts.plusJakartaSans(fontSize: 20, fontWeight: FontWeight.w800, color: DesignSystem.mainText(context))),
              IconButton(icon: const Icon(LucideIcons.x), onPressed: () => Navigator.pop(context)),
            ],
          ),
          const SizedBox(height: 20),

          // Day selector
          Text('Day of Week', style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 12, fontWeight: FontWeight.w700)),
          const SizedBox(height: 10),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _days.map((d) {
                final active = _selectedDay == d;
                return GestureDetector(
                  onTap: () => setState(() => _selectedDay = d),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: active ? primary : DesignSystem.surface(context),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: active ? primary : DesignSystem.glassBorder(context)),
                    ),
                    child: Text(
                      d.substring(0, 3),
                      style: GoogleFonts.inter(
                        color: active ? (Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white) : DesignSystem.mainText(context),
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 20),

          // Time pickers
          Row(
            children: [
              Expanded(child: _timePicker(context, 'Start Time', _startTime, (t) => setState(() => _startTime = t))),
              const SizedBox(width: 16),
              Expanded(child: _timePicker(context, 'End Time', _endTime, (t) => setState(() => _endTime = t))),
            ],
          ),
          const SizedBox(height: 24),

          PrimaryButton(
            text: _isSubmitting ? 'Adding…' : 'Add Slot',
            onPressed: _isSubmitting ? null : _submit,
            isLoading: _isSubmitting,
          ),
        ],
      ),
    );
  }

  Widget _timePicker(BuildContext context, String label, TimeOfDay time, ValueChanged<TimeOfDay> onChanged) {
    return GestureDetector(
      onTap: () async {
        final picked = await showTimePicker(context: context, initialTime: time);
        if (picked != null) onChanged(picked);
      },
      child: GlassContainer(
        padding: const EdgeInsets.all(14),
        borderRadius: 16,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 11, fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            Row(
              children: [
                Icon(LucideIcons.clock, color: DesignSystem.primary(context), size: 16),
                const SizedBox(width: 8),
                Text(time.format(context), style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontWeight: FontWeight.w700, fontSize: 15)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    final svc = ref.read(counselorAppServiceProvider);
    setState(() => _isSubmitting = true);
    final ok = await svc.createSlots([
      {
        'dayOfWeek': _selectedDay,
        'startTime': '${_startTime.hour.toString().padLeft(2, '0')}:${_startTime.minute.toString().padLeft(2, '0')}',
        'endTime': '${_endTime.hour.toString().padLeft(2, '0')}:${_endTime.minute.toString().padLeft(2, '0')}',
      }
    ]);
    setState(() => _isSubmitting = false);
    if (mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(ok ? 'Slots added for next 4 weeks!' : 'Failed to add slot')));
      if (ok) widget.onAdded();
    }
  }
}
