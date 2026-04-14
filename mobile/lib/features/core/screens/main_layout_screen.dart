import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/features/dashboard/screens/dashboard_screen.dart';
import 'package:mobile/features/interview/screens/interview_screen.dart';
import 'package:mobile/features/scholarships/screens/discover_screen.dart';
import 'package:mobile/features/core/theme/design_system.dart';

class MainLayoutScreen extends StatefulWidget {
  const MainLayoutScreen({super.key});

  @override
  State<MainLayoutScreen> createState() => _MainLayoutScreenState();
}

class _MainLayoutScreenState extends State<MainLayoutScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const DashboardScreen(),
    const DiscoverScreen(),
    const InterviewScreen(), // Pathway
    const Center(
      child: Text('Mentors', style: TextStyle(color: Colors.white)),
    ),
    const Center(
      child: Text('Inbox', style: TextStyle(color: Colors.white)),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignSystem.background,
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          IndexedStack(index: _currentIndex, children: _screens),
          _buildBottomNav(),
        ],
      ),
    );
  }

  Widget _buildBottomNav() {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            height: 64, // Compact professional height
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A).withOpacity(0.95),
              border: Border(
                top: BorderSide(
                  color: Colors.white.withOpacity(0.05),
                  width: 1,
                ),
              ),
            ),
            child: Row(
              children: [
                Expanded(child: _buildNavItem(LucideIcons.home, "Home", 0)),
                Expanded(child: _buildNavItem(LucideIcons.compass, "Discover", 1)),
                Expanded(child: _buildNavItem(LucideIcons.trendingUp, "Pathway", 2)),
                Expanded(child: _buildNavItem(LucideIcons.graduationCap, "Mentors", 3)),
                Expanded(child: _buildNavItem(LucideIcons.mail, "Inbox", 4)),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(IconData icon, String label, int index) {
    bool isActive = _currentIndex == index;
    final color = isActive ? const Color(0xFF10B981) : Colors.white.withOpacity(0.4);

    return GestureDetector(
      onTap: () => setState(() => _currentIndex = index),
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            color: color,
            size: 22,
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
