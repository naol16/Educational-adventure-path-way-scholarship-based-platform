import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart'; // Using your existing widget
import 'package:mobile/features/learning_path/screens/mission_detail_screen.dart';
import 'package:mobile/models/learning_mission.dart';

class MasteryHubScreen extends StatelessWidget {
  const MasteryHubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      backgroundColor: isDark ? DesignSystem.background : DesignSystem.backgroundLight,
      body: Stack(
        children: [
          // Background Depth
          Positioned(
            top: -50,
            left: -50,
            child: _buildBlurCircle(
              DesignSystem.primary(context).withOpacity(0.05),
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
                  _buildHeader(context),
                  const SizedBox(height: 30),
                  _buildSkillOverview(context),
                  const SizedBox(height: 35),
                  _buildModuleSelector(context),
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
            child: _buildPathfinderBubble(context),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          "Mastery Hub",
          style: DesignSystem.headingStyle(buildContext: context, fontSize: 24),
        ),
      ],
    );
  }

  Widget _buildSkillOverview(BuildContext context) {
    return GlassContainer(
      padding: const EdgeInsets.all(24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildMiniGauge(context, "READING", 0.40, DesignSystem.primary(context)),
          _buildMiniGauge(context, "LISTENING", 0.20, Colors.blue),
          _buildMiniGauge(context, "WRITING", 0.15, const Color(0xFFF43F5E)),
          _buildMiniGauge(context, "SPEAKING", 0.10, Colors.orange),
        ],
      ),
    );
  }

  Widget _buildMiniGauge(BuildContext context, String label, double value, Color color) {
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
                backgroundColor: DesignSystem.surface(context),
                valueColor: AlwaysStoppedAnimation(color),
              ),
            ),
            Text(
              "${(value * 100).toInt()}%",
              style: DesignSystem.headingStyle(buildContext: context, fontSize: 13),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Text(
          label,
          style: DesignSystem.labelStyle(buildContext: context, fontSize: 8),
        ),
      ],
    );
  }

  Widget _buildModuleSelector(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _buildTab(context, "Reading", true),
          _buildTab(context, "Listening", false),
          _buildTab(context, "Writing", false),
          _buildTab(context, "Speaking", false),
        ],
      ),
    );
  }

  Widget _buildTab(BuildContext context, String label, bool active) {
    final primaryColor = DesignSystem.primary(context);
    return Container(
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: BoxDecoration(
        color: active
            ? primaryColor
            : DesignSystem.surface(context),
        borderRadius: BorderRadius.circular(15),
      ),
      child: Text(
        label,
        style: GoogleFonts.inter(
          color: active 
            ? (Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white)
            : DesignSystem.labelText(context),
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
    final primaryColor = DesignSystem.primary(context);

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
                      decoration: BoxDecoration(
                        color: primaryColor,
                        borderRadius: const BorderRadius.only(
                          bottomLeft: Radius.circular(15),
                        ),
                      ),
                      child: Text(
                        "ACTIVE",
                        style: DesignSystem.labelStyle(
                          buildContext: context,
                          fontSize: 9,
                          fontWeight: FontWeight.w900,
                          color: Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white,
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
                      decoration: BoxDecoration(
                        color: primaryColor,
                        borderRadius: const BorderRadius.only(
                          bottomLeft: Radius.circular(15),
                        ),
                      ),
                      child: Icon(LucideIcons.check, 
                        color: Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white, 
                        size: 12
                      ),
                    ),
                  ),
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        phase,
                        style: DesignSystem.labelStyle(buildContext: context, fontSize: 10).copyWith(
                          color: isLocked ? DesignSystem.labelText(context).withOpacity(0.5) : primaryColor,
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
                              style: DesignSystem.headingStyle(buildContext: context, fontSize: 20).copyWith(
                                color: isLocked ? DesignSystem.mainText(context).withOpacity(0.2) : null,
                              ),
                            ),
                          ),
                          if (isLocked)
                            Icon(
                              LucideIcons.lock,
                              color: DesignSystem.labelText(context).withOpacity(0.5),
                              size: 24,
                            ),
                          if (isCompleted)
                            Icon(
                              LucideIcons.checkCircle2,
                              color: primaryColor,
                              size: 24,
                            ),
                        ],
                      ),
                      if (isLocked && unlockCondition != null) ...[
                        const SizedBox(height: 10),
                        Text(
                          unlockCondition,
                          style: DesignSystem.labelStyle(buildContext: context, fontSize: 11),
                        ),
                      ],
                      if (!isLocked) ...[
                        const SizedBox(height: 25),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            _buildResourceAction(context, LucideIcons.playCircle, "VIDEO"),
                            _buildResourceAction(context, LucideIcons.fileText, "PDF"),
                            _buildResourceAction(context, LucideIcons.edit3, "PRACTICE"),
                            _buildResourceAction(context, LucideIcons.trophy, "TEST"),
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

  Widget _buildResourceAction(BuildContext context, IconData icon, String label) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: DesignSystem.surface(context),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: DesignSystem.primary(context), size: 20),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: DesignSystem.labelStyle(buildContext: context, fontSize: 9),
        ),
      ],
    );
  }

  // --- PATHFINDER FLOATING BUBBLE ---
  Widget _buildPathfinderBubble(BuildContext context) {
    final primaryColor = DesignSystem.primary(context);
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: primaryColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: primaryColor.withOpacity(0.2)),
          ),
          child: Row(
            children: [
              Icon(
                LucideIcons.sparkles,
                color: primaryColor,
                size: 18,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: RichText(
                  text: TextSpan(
                    style: DesignSystem.bodyStyle(buildContext: context, fontSize: 12),
                    children: [
                      TextSpan(
                        text: "Pathfinder: ",
                        style: TextStyle(
                          color: primaryColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const TextSpan(
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
