import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/counselor/screens/counselor_dashboard_screen.dart';
import 'package:mobile/features/counselor/screens/counselor_sessions_screen.dart';
import 'package:mobile/features/counselor/screens/counselor_students_screen.dart';
import 'package:mobile/features/counselor/screens/counselor_schedule_screen.dart';
import 'package:mobile/features/counselor/screens/counselor_messages_screen.dart';
import 'package:mobile/features/counselor/screens/counselor_profile_screen.dart';
import 'package:mobile/features/counselor/screens/counselor_wallet_screen.dart';

final counselorNavigationIndexProvider = StateProvider<int>((ref) => 0);

class CounselorLayoutScreen extends ConsumerStatefulWidget {
  const CounselorLayoutScreen({super.key});

  @override
  ConsumerState<CounselorLayoutScreen> createState() => _CounselorLayoutScreenState();
}

class _CounselorLayoutScreenState extends ConsumerState<CounselorLayoutScreen> {
  final List<Widget> _screens = [
    const CounselorDashboardScreen(),
    const CounselorSessionsScreen(),
    const CounselorScheduleScreen(),
    const CounselorStudentsScreen(),
    const CounselorMessagesScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final currentIndex = ref.watch(counselorNavigationIndexProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? DesignSystem.background : DesignSystem.backgroundLight,
      resizeToAvoidBottomInset: false,
      body: IndexedStack(index: currentIndex, children: _screens),
      bottomNavigationBar: _buildBottomNav(currentIndex),
    );
  }

  Widget _buildBottomNav(int currentIndex) {
    return ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaY: 10, sigmaX: 10),
          child: Container(
            height: 64,
            decoration: BoxDecoration(
              color: DesignSystem.themeBackground(context).withValues(alpha: 0.95),
              border: Border(
                top: BorderSide(
                  color: DesignSystem.surface(context).withValues(alpha: 0.1),
                  width: 1,
                ),
              ),
            ),
            child: Row(
              children: [
                Expanded(child: _buildNavItem(LucideIcons.home, Icons.home_rounded, "Home", 0, currentIndex)),
                Expanded(child: _buildNavItem(LucideIcons.calendarCheck, LucideIcons.calendarCheck, "Sessions", 1, currentIndex)),
                Expanded(child: _buildNavItem(LucideIcons.calendar, LucideIcons.calendar, "Schedule", 2, currentIndex)),
                Expanded(child: _buildNavItem(LucideIcons.users, LucideIcons.users, "Students", 3, currentIndex)),
                Expanded(child: _buildNavItem(LucideIcons.messageSquare, LucideIcons.messageSquare, "Messages", 4, currentIndex)),
              ],
            ),
          ),
      ),
    );
  }

  Widget _buildNavItem(IconData inactiveIcon, IconData activeIcon, String label, int index, int currentIndex) {
    bool isActive = currentIndex == index;
    final primaryColor = DesignSystem.primary(context);
    final color = isActive ? primaryColor : DesignSystem.labelText(context);

    return GestureDetector(
      onTap: () => ref.read(counselorNavigationIndexProvider.notifier).state = index,
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: EdgeInsets.symmetric(horizontal: isActive ? 16 : 8, vertical: 4),
            decoration: BoxDecoration(
              color: isActive ? primaryColor.withValues(alpha: 0.1) : Colors.transparent,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(isActive ? activeIcon : inactiveIcon, color: color, size: 22),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: GoogleFonts.inter(
              color: color,
              fontSize: 10,
              fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
            ),
          ),
        ],
      ),
    );
  }
}
