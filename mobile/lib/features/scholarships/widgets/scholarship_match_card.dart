import 'package:mobile/features/core/theme/design_system.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:mobile/features/core/widgets/glass_container.dart';

class ScholarshipMatchCard extends StatelessWidget {
  final String title;
  final String university;
  final String matchPercent;
  final String aiInsight;
  final String fundingType;
  final VoidCallback? onTap;

  const ScholarshipMatchCard({
    super.key,
    required this.title,
    required this.university,
    required this.matchPercent,
    required this.aiInsight,
    required this.fundingType,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: GlassContainer(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // University Logo
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(LucideIcons.graduationCap, color: Colors.white70),
                ),
                const SizedBox(width: 16),
                // Title and Uni
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: GoogleFonts.plusJakartaSans(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      Text(
                        university,
                        style: GoogleFonts.inter(color: Colors.white38, fontSize: 13),
                      ),
                    ],
                  ),
                ),
                // Match Badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: DesignSystem.emerald.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    "$matchPercent Match",
                    style: GoogleFonts.inter(
                      color: DesignSystem.emerald,
                      fontWeight: FontWeight.bold,
                      fontSize: 11,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // AI Insight Snippet (The "Why")
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: DesignSystem.emerald.withOpacity(0.1)),
              ),
              child: Row(
                children: [
                  const Icon(LucideIcons.sparkles, color: DesignSystem.emerald, size: 14),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      aiInsight,
                      style: GoogleFonts.inter(
                        color: Colors.white70,
                        fontSize: 12,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Footer Tags
            Row(
              children: [
                _buildTag(fundingType, LucideIcons.wallet),
                const SizedBox(width: 12),
                _buildTag("Masters", LucideIcons.bookOpen),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildTag(String text, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 12, color: Colors.white24),
        const SizedBox(width: 4),
        Text(
          text,
          style: GoogleFonts.inter(
            color: Colors.white24,
            fontSize: 11,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}







