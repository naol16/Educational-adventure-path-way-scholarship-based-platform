import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/widgets/glass_container.dart'; // Using your existing widget
import 'package:mobile/features/learning_path/screens/mission_detail_screen.dart';
import 'package:mobile/models/learning_mission.dart';

class MasteryHubScreen extends StatelessWidget {
  const MasteryHubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Stack(
        children: [
          // Background Depth
          Positioned(
            top: -50,
            left: -50,
            child: _buildBlurCircle(
              const Color(0xFF10B981).withOpacity(0.05),
              250,
            ),
          ),

          SafeArea(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 20),
                  _buildHeader(),
                  const SizedBox(height: 30),
                  _buildSkillOverview(),
                  const SizedBox(height: 35),
                  _buildModuleSelector(),
                  const SizedBox(height: 30),
                  _buildMissionCard(
                    context,
                    missionNumber: "01",
                    title: "Skimming Techniques",
                    phase: "MASTERY PHASE 1",
                    status: MissionStatus.active,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const MissionDetailScreen(),
                        ),
                      );
                    },
                  ),
                  _buildMissionCard(
                    context,
                    missionNumber: "02",
                    title: "Scanning for Detail",
                    phase: "MASTERY PHASE 1",
                    status: MissionStatus.locked,
                    unlockCondition: "70% Score Required in Mission 01",
                  ),
                  _buildMissionCard(
                    context,
                    missionNumber: "03",
                    title: "Inference & Logic",
                    phase: "MASTERY PHASE 2",
                    status: MissionStatus.locked,
                  ),
                  const SizedBox(height: 120),
                ],
              ),
            ),
          ),

          // Pathfinder Floating Insight
          Positioned(
            bottom: 90,
            left: 20,
            right: 20,
            child: _buildPathfinderBubble(),
          ),
        ],
      ),
    );
  }

  // --- HEADER ---
  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          "Mastery Hub",
          style: GoogleFonts.plusJakartaSans(
            color: Colors.white,
            fontSize: 24,
            fontWeight: FontWeight.w800,
          ),
        ),
        const Icon(LucideIcons.bell, color: Color(0xFF10B981), size: 22),
      ],
    );
  }

  // --- SKILL OVERVIEW (Gauges) ---
  Widget _buildSkillOverview() {
    return GlassContainer(
      padding: const EdgeInsets.all(24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildMiniGauge("READING", 0.40, const Color(0xFF10B981)),
          _buildMiniGauge("LISTENING", 0.20, Colors.blueAccent),
          _buildMiniGauge("WRITING", 0.15, const Color(0xFFF43F5E)),
          _buildMiniGauge("SPEAKING", 0.10, Colors.amber),
        ],
      ),
    );
  }

  Widget _buildMiniGauge(String label, double value, Color color) {
    return Column(
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            SizedBox(
              width: 55,
              height: 55,
              child: CircularProgressIndicator(
                value: value,
                strokeWidth: 4,
                backgroundColor: Colors.white10,
                valueColor: AlwaysStoppedAnimation(color),
              ),
            ),
            Text(
              "${(value * 100).toInt()}%",
              style: GoogleFonts.plusJakartaSans(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Text(
          label,
          style: GoogleFonts.inter(
            color: Colors.white38,
            fontSize: 8,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
      ],
    );
  }

  // --- MODULE SELECTOR (Tabs) ---
  Widget _buildModuleSelector() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _buildTab("Reading", true),
          _buildTab("Listening", false),
          _buildTab("Writing", false),
          _buildTab("Speaking", false),
        ],
      ),
    );
  }

  Widget _buildTab(String label, bool active) {
    return Container(
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: BoxDecoration(
        color: active
            ? const Color(0xFF10B981)
            : Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(15),
      ),
      child: Text(
        label,
        style: GoogleFonts.inter(
          color: active ? Colors.black : Colors.white54,
          fontWeight: FontWeight.bold,
          fontSize: 13,
        ),
      ),
    );
  }

  Widget _buildMissionCard(
    BuildContext context, {
    required String missionNumber,
    required String title,
    required String phase,
    required MissionStatus status,
    String? unlockCondition,
    VoidCallback? onTap,
  }) {
    bool isLocked = status == MissionStatus.locked;
    bool isActive = status == MissionStatus.active;
    bool isCompleted = status == MissionStatus.completed;

    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: GestureDetector(
        onTap: isLocked ? null : onTap,
        child: Opacity(
          opacity: isLocked ? 0.6 : 1,
          child: GlassContainer(
            padding: const EdgeInsets.all(0), // Handled by inner column
            child: Column(
              children: [
                if (isActive)
                  Align(
                    alignment: Alignment.topRight,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 4,
                      ),
                      decoration: const BoxDecoration(
                        color: Color(0xFF10B981),
                        borderRadius: BorderRadius.only(
                          bottomLeft: Radius.circular(15),
                        ),
                      ),
                      child: Text(
                        "ACTIVE",
                        style: GoogleFonts.inter(
                          color: Colors.black,
                          fontSize: 9,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ),
                if (isCompleted)
                  Align(
                    alignment: Alignment.topRight,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 4,
                      ),
                      decoration: const BoxDecoration(
                        color: Color(0xFF10B981),
                        borderRadius: BorderRadius.only(
                          bottomLeft: Radius.circular(15),
                        ),
                      ),
                      child: const Icon(LucideIcons.check, color: Colors.black, size: 12),
                    ),
                  ),
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        phase,
                        style: GoogleFonts.plusJakartaSans(
                          color: isLocked
                              ? Colors.white24
                              : const Color(0xFF10B981),
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              "Mission $missionNumber: $title",
                              style: GoogleFonts.plusJakartaSans(
                                color: isLocked ? Colors.white24 : Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          if (isLocked)
                            const Icon(
                              LucideIcons.lock,
                              color: Colors.white24,
                              size: 24,
                            ),
                          if (isCompleted)
                            const Icon(
                              LucideIcons.checkCircle2,
                              color: Color(0xFF10B981),
                              size: 24,
                            ),
                        ],
                      ),
                      if (isLocked && unlockCondition != null) ...[
                        const SizedBox(height: 10),
                        Text(
                          unlockCondition,
                          style: GoogleFonts.inter(
                            color: Colors.white24,
                            fontSize: 11,
                          ),
                        ),
                      ],
                      if (!isLocked) ...[
                        const SizedBox(height: 25),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            _buildResourceAction(LucideIcons.playCircle, "VIDEO"),
                            _buildResourceAction(LucideIcons.fileText, "PDF"),
                            _buildResourceAction(LucideIcons.edit3, "PRACTICE"),
                            _buildResourceAction(LucideIcons.trophy, "TEST"),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildResourceAction(IconData icon, String label) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: const Color(0xFF10B981), size: 20),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: GoogleFonts.inter(
            color: Colors.white54,
            fontSize: 9,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  // --- PATHFINDER FLOATING BUBBLE ---
  Widget _buildPathfinderBubble() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF10B981).withOpacity(0.1),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFF10B981).withOpacity(0.2)),
          ),
          child: Row(
            children: [
              const Icon(
                LucideIcons.sparkles,
                color: Color(0xFF10B981),
                size: 18,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: RichText(
                  text: TextSpan(
                    style: GoogleFonts.inter(color: Colors.white, fontSize: 12),
                    children: const [
                      TextSpan(
                        text: "Pathfinder: ",
                        style: TextStyle(
                          color: Color(0xFF10B981),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      TextSpan(
                        text: "You are ready for the Test in Mission 01!",
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBlurCircle(Color color, double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
        boxShadow: [BoxShadow(color: color, blurRadius: 100, spreadRadius: 50)],
      ),
    );
  }
}
