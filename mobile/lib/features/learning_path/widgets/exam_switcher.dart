import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

enum ExamType { ielts, toefl }

class ExamSwitcher extends StatelessWidget {
  final ExamType activeType;
  final Function(ExamType) onToggle;

  const ExamSwitcher({super.key, required this.activeType, required this.onToggle});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Center(
      child: Container(
        width: 220,
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: isDark ? Colors.white.withValues(alpha: 0.07) : Colors.black.withValues(alpha: 0.06),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isDark ? Colors.white.withValues(alpha: 0.12) : Colors.black.withValues(alpha: 0.1),
          ),
        ),
        child: Row(
          children: [
            _buildToggleItem(context, "IELTS", ExamType.ielts),
            _buildToggleItem(context, "TOEFL", ExamType.toefl),
          ],
        ),
      ),
    );
  }

  Widget _buildToggleItem(BuildContext context, String label, ExamType type) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isActive = activeType == type;
    final activeColor = type == ExamType.ielts ? const Color(0xFF10B981) : const Color(0xFF3B82F6);
    // Inactive text: white54 on dark, slate-600 on light — always readable
    final inactiveColor = isDark ? Colors.white54 : const Color(0xFF475569);

    return Expanded(
      child: GestureDetector(
        onTap: () => onToggle(type),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isActive ? activeColor : Colors.transparent,
            borderRadius: BorderRadius.circular(16),
            boxShadow: isActive
                ? [BoxShadow(color: activeColor.withValues(alpha: 0.3), blurRadius: 10)]
                : [],
          ),
          child: Center(
            child: Text(
              label,
              style: GoogleFonts.plusJakartaSans(
                color: isActive
                    ? (type == ExamType.ielts ? Colors.black : Colors.white)
                    : inactiveColor,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
