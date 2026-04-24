import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

enum ExamType { ielts, toefl }

class ExamSwitcher extends StatelessWidget {
  final ExamType activeType;
  final Function(ExamType) onToggle;

  const ExamSwitcher({super.key, required this.activeType, required this.onToggle});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width: 220,
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.1)),
        ),
        child: Row(
          children: [
            _buildToggleItem("IELTS", ExamType.ielts),
            _buildToggleItem("TOEFL", ExamType.toefl),
          ],
        ),
      ),
    );
  }

  Widget _buildToggleItem(String label, ExamType type) {
    bool isActive = activeType == type;
    Color activeColor = type == ExamType.ielts ? const Color(0xFF10B981) : const Color(0xFF3B82F6);

    return Expanded(
      child: GestureDetector(
        onTap: () => onToggle(type),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isActive ? activeColor : Colors.transparent,
            borderRadius: BorderRadius.circular(16),
            boxShadow: isActive ? [BoxShadow(color: activeColor.withOpacity(0.3), blurRadius: 10)] : [],
          ),
          child: Center(
            child: Text(
              label,
              style: GoogleFonts.plusJakartaSans(
                color: isActive ? (type == ExamType.ielts ? Colors.black : Colors.white) : Colors.white38,
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
