import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:intl/intl.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/counselor/providers/counselor_providers.dart';
import 'package:mobile/features/mentors/models/booking_models.dart';
import 'package:mobile/features/counselor/widgets/add_slot_bottom_sheet.dart';

class CounselorScheduleScreen extends ConsumerStatefulWidget {
  const CounselorScheduleScreen({super.key});

  @override
  ConsumerState<CounselorScheduleScreen> createState() => _CounselorScheduleScreenState();
}

class _CounselorScheduleScreenState extends ConsumerState<CounselorScheduleScreen> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  CalendarFormat _calendarFormat = CalendarFormat.week;

  @override
  Widget build(BuildContext context) {
    final slotsAsync = ref.watch(counselorSlotsProvider);
    final primary = DesignSystem.primary(context);

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openAddSlot(context, ref),
        backgroundColor: primary,
        icon: Icon(LucideIcons.plus, color: Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white),
        label: Text('Add Slot', style: GoogleFonts.inter(color: Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white, fontWeight: FontWeight.w700)),
      ),
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(context),
            const SizedBox(height: 8),
            slotsAsync.when(
              data: (slots) => _buildCalendar(context, slots, primary),
              loading: () => const LinearProgressIndicator(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            const SizedBox(height: 8),
            Expanded(
              child: slotsAsync.when(
                data: (slots) {
                  final daySlots = _getSlotsForDay(slots, _selectedDay ?? _focusedDay);
                  return _buildSlotList(context, ref, daySlots);
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, _) => Center(child: Text('Error loading slots', style: TextStyle(color: Colors.red))),
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
                Text('Schedule', style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 24, fontWeight: FontWeight.w800)),
                Text('Manage your availability', style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 13)),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => setState(() => _calendarFormat = _calendarFormat == CalendarFormat.week ? CalendarFormat.month : CalendarFormat.week),
            child: GlassContainer(
              padding: const EdgeInsets.all(10),
              borderRadius: 12,
              child: Icon(_calendarFormat == CalendarFormat.week ? LucideIcons.calendarDays : LucideIcons.calendar, color: DesignSystem.mainText(context), size: 20),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCalendar(BuildContext context, List<AvailabilitySlot> slots, Color primary) {
    final slotDates = slots.map((s) => DateTime(s.startTime.year, s.startTime.month, s.startTime.day)).toSet();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GlassContainer(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        borderRadius: 24,
        child: TableCalendar(
          firstDay: DateTime.now().subtract(const Duration(days: 30)),
          lastDay: DateTime.now().add(const Duration(days: 90)),
          focusedDay: _focusedDay,
          calendarFormat: _calendarFormat,
          selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
          onDaySelected: (selected, focused) => setState(() { _selectedDay = selected; _focusedDay = focused; }),
          onFormatChanged: (f) => setState(() => _calendarFormat = f),
          onPageChanged: (f) => setState(() => _focusedDay = f),
          eventLoader: (day) => slotDates.contains(DateTime(day.year, day.month, day.day)) ? [true] : [],
          calendarStyle: CalendarStyle(
            outsideDaysVisible: false,
            selectedDecoration: BoxDecoration(color: primary, shape: BoxShape.circle),
            todayDecoration: BoxDecoration(color: primary.withValues(alpha: 0.2), shape: BoxShape.circle),
            todayTextStyle: TextStyle(color: primary, fontWeight: FontWeight.w800),
            selectedTextStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
            defaultTextStyle: GoogleFonts.inter(color: DesignSystem.mainText(context)),
            weekendTextStyle: GoogleFonts.inter(color: DesignSystem.labelText(context)),
            markerDecoration: BoxDecoration(color: const Color(0xFF10B981), shape: BoxShape.circle),
          ),
          headerStyle: HeaderStyle(
            formatButtonVisible: false,
            titleCentered: true,
            titleTextStyle: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontWeight: FontWeight.w800, fontSize: 15),
            leftChevronIcon: Icon(LucideIcons.chevronLeft, color: DesignSystem.mainText(context), size: 18),
            rightChevronIcon: Icon(LucideIcons.chevronRight, color: DesignSystem.mainText(context), size: 18),
          ),
          daysOfWeekStyle: DaysOfWeekStyle(
            weekdayStyle: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 12, fontWeight: FontWeight.w600),
            weekendStyle: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 12),
          ),
        ),
      ),
    );
  }

  Widget _buildSlotList(BuildContext context, WidgetRef ref, List<AvailabilitySlot> slots) {
    final day = _selectedDay ?? _focusedDay;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          child: Text(
            DateFormat('EEEE, MMMM d').format(day),
            style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 15, fontWeight: FontWeight.w700),
          ),
        ),
        Expanded(
          child: slots.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(LucideIcons.calendarOff, color: DesignSystem.labelText(context), size: 44),
                      const SizedBox(height: 12),
                      Text('No slots on this day', style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 14, fontWeight: FontWeight.w600)),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: slots.length,
                  itemBuilder: (ctx, i) => _buildSlotCard(context, ref, slots[i]),
                ),
        ),
      ],
    );
  }

  Widget _buildSlotCard(BuildContext context, WidgetRef ref, AvailabilitySlot slot) {
    final isBooked = slot.status == 'booked';
    final color = isBooked ? const Color(0xFFF59E0B) : const Color(0xFF10B981);
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: GlassContainer(
        padding: const EdgeInsets.all(14),
        borderRadius: 18,
        borderColor: color.withValues(alpha: 0.3),
        child: Row(
          children: [
            Container(
              width: 4,
              height: 48,
              decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4)),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${DateFormat('h:mm a').format(slot.startTime)} – ${DateFormat('h:mm a').format(slot.endTime)}',
                    style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontWeight: FontWeight.w700, fontSize: 14),
                  ),
                  const SizedBox(height: 2),
                  Text(isBooked ? 'Booked' : 'Available', style: GoogleFonts.inter(color: color, fontSize: 11, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
            if (!isBooked)
              GestureDetector(
                onTap: () => _deleteSlot(context, ref, slot.id),
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                  child: const Icon(LucideIcons.trash2, color: Colors.red, size: 16),
                ),
              ),
          ],
        ),
      ),
    );
  }

  List<AvailabilitySlot> _getSlotsForDay(List<AvailabilitySlot> slots, DateTime day) {
    return slots.where((s) => isSameDay(s.startTime, day)).toList()
      ..sort((a, b) => a.startTime.compareTo(b.startTime));
  }

  void _openAddSlot(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => AddSlotBottomSheet(onAdded: () => ref.invalidate(counselorSlotsProvider)),
    );
  }

  Future<void> _deleteSlot(BuildContext context, WidgetRef ref, int slotId) async {
    final ok = await ref.read(counselorAppServiceProvider).deleteSlot(slotId);
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(ok ? 'Slot removed' : 'Failed to remove slot')));
      if (ok) ref.invalidate(counselorSlotsProvider);
    }
  }
}
