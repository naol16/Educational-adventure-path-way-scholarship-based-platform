import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:mobile/features/mentors/models/booking_models.dart';
import 'package:mobile/features/mentors/providers/mentors_providers.dart';

class BookingBottomSheet extends ConsumerStatefulWidget {
  final int counselorId;
  final String counselorName;

  const BookingBottomSheet({
    super.key,
    required this.counselorId,
    required this.counselorName,
  });

  @override
  ConsumerState<BookingBottomSheet> createState() => _BookingBottomSheetState();
}

class _BookingBottomSheetState extends ConsumerState<BookingBottomSheet> {
  AvailabilitySlot? _selectedSlot;
  bool _isBooking = false;

  void _confirmBooking() async {
    if (_selectedSlot == null) return;

    setState(() => _isBooking = true);
    
    final result = await ref.read(counselorServiceProvider).createBooking(
      widget.counselorId,
      _selectedSlot!.id,
    );

    if (mounted) {
      setState(() => _isBooking = false);
      if (result != null) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Booking confirmed for ${DateFormat('MMM d, jm').format(_selectedSlot!.startTime)}")),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Failed to book session")),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final slotsAsync = ref.watch(availableSlotsProvider(widget.counselorId));

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: DesignSystem.themeBackground(context),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("Book a Session", style: GoogleFonts.plusJakartaSans(fontSize: 20, fontWeight: FontWeight.bold, color: DesignSystem.mainText(context))),
              IconButton(icon: const Icon(LucideIcons.x), onPressed: () => Navigator.pop(context)),
            ],
          ),
          Text("Select an available slot with ${widget.counselorName}", style: GoogleFonts.inter(fontSize: 14, color: DesignSystem.labelText(context))),
          const SizedBox(height: 24),
          
          ConstrainedBox(
            constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.4),
            child: slotsAsync.when(
              data: (slots) {
                if (slots.isEmpty) {
                  return Center(child: Text("No available slots found.", style: TextStyle(color: DesignSystem.labelText(context))));
                }
                return ListView.builder(
                  shrinkWrap: true,
                  itemCount: slots.length,
                  itemBuilder: (context, index) {
                    final slot = slots[index];
                    final isSelected = _selectedSlot?.id == slot.id;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedSlot = slot),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isSelected ? DesignSystem.primary(context).withValues(alpha: 0.1) : DesignSystem.surface(context),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: isSelected ? DesignSystem.primary(context) : DesignSystem.glassBorder(context)),
                        ),
                        child: Row(
                          children: [
                            Icon(LucideIcons.calendar, color: isSelected ? DesignSystem.primary(context) : DesignSystem.labelText(context), size: 20),
                            const SizedBox(width: 16),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(DateFormat('EEEE, MMM d').format(slot.startTime), style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: DesignSystem.mainText(context))),
                                Text(DateFormat('jm').format(slot.startTime), style: GoogleFonts.inter(fontSize: 12, color: DesignSystem.labelText(context))),
                              ],
                            ),
                            const Spacer(),
                            if (isSelected) Icon(LucideIcons.checkCircle, color: DesignSystem.primary(context), size: 20),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) => Center(child: Text("Error loading slots", style: TextStyle(color: Colors.red))),
            ),
          ),
          
          const SizedBox(height: 24),
          PrimaryButton(
            onPressed: _selectedSlot != null && !_isBooking ? _confirmBooking : null,
            text: _isBooking ? "Confirming..." : "Confirm Booking",
            isLoading: _isBooking,
          ),
          SizedBox(height: MediaQuery.of(context).padding.bottom),
        ],
      ),
    );
  }
}
