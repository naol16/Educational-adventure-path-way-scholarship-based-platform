import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/counselor/providers/counselor_providers.dart';
import 'package:mobile/features/counselor/models/counselor_models.dart';

class StudentProgressDetailScreen extends ConsumerWidget {
  final StudentSummary student;
  const StudentProgressDetailScreen({super.key, required this.student});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final progressAsync = ref.watch(studentProgressProvider(student.id));
    final primary = DesignSystem.primary(context);

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: Stack(
        children: [
          Positioned(top: -50, right: -50, child: DesignSystem.buildBlurCircle(primary.withValues(alpha: 0.05), 200)),
          CustomScrollView(
            slivers: [
              SliverAppBar(
                pinned: true,
                expandedHeight: 220,
                backgroundColor: DesignSystem.themeBackground(context),
                leading: IconButton(
                  icon: Icon(LucideIcons.chevronLeft, color: DesignSystem.mainText(context)),
                  onPressed: () => Navigator.pop(context),
                ),
                flexibleSpace: FlexibleSpaceBar(
                  background: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [primary.withValues(alpha: 0.12), DesignSystem.themeBackground(context)],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        CircleAvatar(
                          radius: 40,
                          backgroundColor: primary.withValues(alpha: 0.15),
                          backgroundImage: student.avatarUrl != null ? NetworkImage(student.avatarUrl!) : null,
                          child: student.avatarUrl == null
                              ? Text(student.name.substring(0, 1).toUpperCase(), style: GoogleFonts.plusJakartaSans(color: primary, fontWeight: FontWeight.w800, fontSize: 28))
                              : null,
                        ),
                        const SizedBox(height: 12),
                        Text(student.name, style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 22, fontWeight: FontWeight.w800)),
                        if (student.fieldOfStudy != null)
                          Text(student.fieldOfStudy!, style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 13)),
                        const SizedBox(height: 16),
                      ],
                    ),
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: progressAsync.when(
                    data: (progress) => _buildProgress(context, progress),
                    loading: () => const Center(child: Padding(padding: EdgeInsets.all(40), child: CircularProgressIndicator())),
                    error: (e, _) => Center(child: Text('Failed to load progress', style: TextStyle(color: Colors.red))),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProgress(BuildContext context, Map<String, dynamic>? progress) {
    if (progress == null) {
      return Center(
        child: Column(
          children: [
            Icon(LucideIcons.barChart2, color: DesignSystem.labelText(context), size: 48),
            const SizedBox(height: 16),
            Text('No progress data yet', style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 16, fontWeight: FontWeight.w700)),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Quick stats
        Row(
          children: [
            _statCard(context, '${progress['sessionCount'] ?? student.sessionCount}', 'Sessions', LucideIcons.calendar),
            const SizedBox(width: 12),
            _statCard(context, '${progress['completedMissions'] ?? 0}', 'Missions', LucideIcons.target),
            const SizedBox(width: 12),
            _statCard(context, '${progress['scholarshipsTracked'] ?? 0}', 'Scholarships', LucideIcons.award),
          ],
        ),
        const SizedBox(height: 24),

        // Learning path progress
        if (progress['learningPath'] != null) ...[
          Text('Learning Path', style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 16, fontWeight: FontWeight.w800)),
          const SizedBox(height: 12),
          GlassContainer(
            padding: const EdgeInsets.all(18),
            borderRadius: 20,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(progress['learningPath']['name'] ?? 'Active Path', style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 14, fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                _buildProgressBar(context, (progress['progressPercentage'] as num?)?.toDouble() ?? 0),
                const SizedBox(height: 6),
                Text('${(progress['progressPercentage'] as num?)?.toInt() ?? 0}% complete', style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 12)),
              ],
            ),
          ),
          const SizedBox(height: 20),
        ],

        // Assessment results
        if (progress['assessments'] != null && (progress['assessments'] as List).isNotEmpty) ...[
          Text('Assessment Results', style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 16, fontWeight: FontWeight.w800)),
          const SizedBox(height: 12),
          ...(progress['assessments'] as List).take(3).map((a) => _buildAssessmentRow(context, a)).toList(),
          const SizedBox(height: 20),
        ],

        // Scholarships
        if (progress['scholarships'] != null && (progress['scholarships'] as List).isNotEmpty) ...[
          Text('Tracked Scholarships', style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 16, fontWeight: FontWeight.w800)),
          const SizedBox(height: 12),
          ...(progress['scholarships'] as List).take(3).map((s) => _buildScholarshipRow(context, s)).toList(),
        ],

        const SizedBox(height: 80),
      ],
    );
  }

  Widget _statCard(BuildContext context, String value, String label, IconData icon) {
    return Expanded(
      child: GlassContainer(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        borderRadius: 18,
        child: Column(
          children: [
            Icon(icon, color: DesignSystem.primary(context), size: 20),
            const SizedBox(height: 8),
            Text(value, style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 18, fontWeight: FontWeight.w800)),
            Text(label, style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 10)),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressBar(BuildContext context, double percent) {
    final pct = (percent / 100).clamp(0.0, 1.0);
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: LinearProgressIndicator(
        value: pct,
        minHeight: 8,
        backgroundColor: DesignSystem.surface(context),
        valueColor: AlwaysStoppedAnimation<Color>(DesignSystem.primary(context)),
      ),
    );
  }

  Widget _buildAssessmentRow(BuildContext context, dynamic a) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: GlassContainer(
        padding: const EdgeInsets.all(14),
        borderRadius: 16,
        child: Row(
          children: [
            Icon(LucideIcons.fileText, color: DesignSystem.primary(context), size: 16),
            const SizedBox(width: 10),
            Expanded(child: Text(a['assessmentType'] ?? 'Assessment', style: GoogleFonts.inter(color: DesignSystem.mainText(context), fontSize: 13, fontWeight: FontWeight.w600))),
            Text('${a['overallBand'] ?? a['totalScore'] ?? '--'}', style: GoogleFonts.plusJakartaSans(color: DesignSystem.primary(context), fontWeight: FontWeight.w800)),
          ],
        ),
      ),
    );
  }

  Widget _buildScholarshipRow(BuildContext context, dynamic s) {
    Color statusColor = s['status'] == 'applied' ? const Color(0xFF10B981) : DesignSystem.labelText(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: GlassContainer(
        padding: const EdgeInsets.all(14),
        borderRadius: 16,
        child: Row(
          children: [
            Icon(LucideIcons.award, color: DesignSystem.primary(context), size: 16),
            const SizedBox(width: 10),
            Expanded(child: Text(s['name'] ?? 'Scholarship', style: GoogleFonts.inter(color: DesignSystem.mainText(context), fontSize: 13, fontWeight: FontWeight.w600))),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
              child: Text(s['status'] ?? 'tracking', style: GoogleFonts.inter(color: statusColor, fontSize: 10, fontWeight: FontWeight.w700)),
            ),
          ],
        ),
      ),
    );
  }
}
