import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:mobile/features/core/theme/design_system.dart';

class MissionDetailScreen extends StatelessWidget {
  const MissionDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignSystem.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Stack(
        children: [
          // Background Glow
          Positioned(
            top: -100,
            right: -50,
            child: DesignSystem.buildBlurCircle(
              DesignSystem.emerald.withOpacity(0.05),
              300,
            ),
          ),
          
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "MISSION 01",
                  style: GoogleFonts.plusJakartaSans(
                    color: DesignSystem.emerald,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  "Skimming Techniques",
                  style: GoogleFonts.plusJakartaSans(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 30),
                
                // THE 4 PILLARS GRID
                Expanded(
                  child: GridView.count(
                    crossAxisCount: 2,
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    childAspectRatio: 0.85,
                    children: [
                      _buildActionCard(LucideIcons.playCircle, "Watch Video", "Strategy", () {
                        // Navigate to YouTube Player Screen
                      }),
                      _buildActionCard(LucideIcons.fileText, "Read Briefing", "PDF Guide", () {
                        // Open PDF Viewer
                      }),
                      _buildActionCard(LucideIcons.edit3, "Practice Drill", "Active Training", () {
                        // Start Quiz Engine
                      }),
                      _buildActionCard(LucideIcons.trophy, "Unit Test", "Evaluation", () {
                        // Start Final Exam
                      }, isLocked: true),
                    ],
                  ),
                ),
                
                PrimaryButton(
                  text: "RESUME MISSION",
                  onPressed: () {},
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionCard(
    IconData icon,
    String title,
    String sub,
    VoidCallback onTap, {
    bool isLocked = false,
  }) {
    return GestureDetector(
      onTap: isLocked ? null : onTap,
      child: GlassContainer(
        padding: const EdgeInsets.all(20),
        borderRadius: 24,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isLocked ? Colors.white10 : DesignSystem.emerald,
              size: 32,
            ),
            const SizedBox(height: 16),
            Text(
              title,
              textAlign: TextAlign.center,
              style: GoogleFonts.plusJakartaSans(
                color: isLocked ? Colors.white24 : Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              sub,
              style: GoogleFonts.inter(
                color: Colors.white38,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
