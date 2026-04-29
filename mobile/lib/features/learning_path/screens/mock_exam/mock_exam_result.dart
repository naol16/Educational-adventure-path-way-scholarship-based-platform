import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:mobile/features/learning_path/providers/mock_exam_provider.dart';

class MockExamResult extends ConsumerWidget {
  const MockExamResult({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(mockExamProvider);
    final notifier = ref.read(mockExamProvider.notifier);
    final primary = DesignSystem.primary(context);

    final result = state.result;
    final evaluation = result?['data'] ?? result?['evaluation'] ?? {};
    final scoreBreakdown = (evaluation['score_breakdown'] as Map?)?.cast<String, dynamic>() ?? {};
    final overallBand = _toDouble(evaluation['overall_band'] ?? evaluation['overallBand']);
    final feedbackReport = evaluation['feedback_report'] as String? ?? '';
    final adaptiveTags = (evaluation['adaptive_learning_tags'] as List?)?.cast<String>() ?? [];
    final gapAnalysis = evaluation['competency_gap_analysis'];
    final curriculumMap = evaluation['adaptive_curriculum_map'];
    final examType = state.examType;
    final isToefl = examType == 'TOEFL';
    final maxScore = isToefl ? 120.0 : 9.0;
    // TOEFL: each section is 0-30. IELTS: each section is 0-9.
    final maxSectionScore = isToefl ? 30.0 : 9.0;
    final threshold = isToefl ? 90.0 : 6.5;

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: Stack(
        children: [
          Positioned(
            top: -60, left: -40,
            child: DesignSystem.buildBlurCircle(primary.withValues(alpha: 0.06), 260),
          ),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
              child: Column(
                children: [
                  // Success header
                  _SuccessHeader(overallBand: overallBand, maxScore: maxScore, isToefl: isToefl),
                  const SizedBox(height: 24),

                  // Score breakdown
                  _ScoreBreakdown(
                    scores: scoreBreakdown,
                    maxScore: maxScore,
                    maxSectionScore: maxSectionScore,
                    isToefl: isToefl,
                  ),
                  const SizedBox(height: 20),

                  // Scholarship threshold
                  if (overallBand >= threshold) ...[
                    _ThresholdBadge(threshold: threshold, band: overallBand, isToefl: isToefl),
                    const SizedBox(height: 20),
                  ],

                  // AI Feedback
                  if (feedbackReport.isNotEmpty) ...[
                    _FeedbackCard(feedback: feedbackReport),
                    const SizedBox(height: 20),
                  ],

                  // Areas to improve
                  if (adaptiveTags.isNotEmpty) ...[
                    _ImprovementTags(tags: adaptiveTags),
                    const SizedBox(height: 20),
                  ],

                  // Gap analysis
                  if (gapAnalysis != null) ...[
                    _GapAnalysisCard(data: gapAnalysis),
                    const SizedBox(height: 20),
                  ],

                  // Curriculum sprints
                  if (curriculumMap != null) ...[
                    _CurriculumCard(data: curriculumMap),
                    const SizedBox(height: 20),
                  ],

                  // Back button
                  PrimaryButton(
                    text: 'BACK TO DASHBOARD',
                    onPressed: notifier.backToDashboard,
                    isOutlined: true,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  double _toDouble(dynamic v) {
    if (v == null) return 0.0;
    if (v is num) return v.toDouble();
    return double.tryParse(v.toString()) ?? 0.0;
  }
}

// ─── Success Header ───────────────────────────────────────────────────────────

class _SuccessHeader extends StatelessWidget {
  final double overallBand, maxScore;
  final bool isToefl;
  const _SuccessHeader({required this.overallBand, required this.maxScore, required this.isToefl});

  @override
  Widget build(BuildContext context) {
    final primary = DesignSystem.primary(context);
    final pct = (overallBand / maxScore).clamp(0.0, 1.0);

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: primary.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(LucideIcons.checkCircle, size: 48, color: primary),
        ),
        const SizedBox(height: 16),
        Text('Assessment Complete!',
            style: DesignSystem.headingStyle(buildContext: context, fontSize: 22)),
        const SizedBox(height: 6),
        Text(
          'Your AI evaluation is ready.',
          style: DesignSystem.labelStyle(buildContext: context, fontSize: 13),
        ),
        const SizedBox(height: 24),
        GlassContainer(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              Text(
                isToefl ? 'Overall Score' : 'Overall Band Score',
                style: DesignSystem.labelStyle(buildContext: context, fontSize: 12),
              ),
              const SizedBox(height: 8),
              Text(
                isToefl ? overallBand.toStringAsFixed(0) : overallBand.toStringAsFixed(1),
                style: DesignSystem.headingStyle(buildContext: context, fontSize: 64)
                    .copyWith(color: primary),
              ),
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0, end: pct),
                  duration: const Duration(milliseconds: 1000),
                  curve: Curves.easeOutCubic,
                  builder: (ctx, val, _) => LinearProgressIndicator(
                    value: val,
                    minHeight: 8,
                    backgroundColor: DesignSystem.surface(context),
                    valueColor: AlwaysStoppedAnimation(primary),
                  ),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                '${(pct * 100).toStringAsFixed(0)}% of max ${isToefl ? '120' : '9.0'}',
                style: DesignSystem.labelStyle(buildContext: context, fontSize: 11),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ─── Score Breakdown ──────────────────────────────────────────────────────────

class _ScoreBreakdown extends StatelessWidget {
  final Map<String, dynamic> scores;
  final double maxScore;
  final double maxSectionScore;
  final bool isToefl;
  const _ScoreBreakdown({required this.scores, required this.maxScore, required this.maxSectionScore, required this.isToefl});

  @override
  Widget build(BuildContext context) {
    final items = [
      _ScoreItem('Reading', scores['reading'], LucideIcons.bookOpen, DesignSystem.primary(context)),
      _ScoreItem('Listening', scores['listening'], LucideIcons.headphones, Colors.blue),
      _ScoreItem('Writing', scores['writing'], LucideIcons.edit3, const Color(0xFFF43F5E)),
      _ScoreItem('Speaking', scores['speaking'], LucideIcons.mic, Colors.orange),
    ];

    return GlassContainer(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(LucideIcons.trendingUp, size: 16, color: DesignSystem.primary(context)),
              const SizedBox(width: 8),
              Text('Section Breakdown',
                  style: DesignSystem.headingStyle(buildContext: context, fontSize: 15)),
            ],
          ),
          const SizedBox(height: 16),
          ...items.map((item) => _buildRow(context, item)),
        ],
      ),
    );
  }

  Widget _buildRow(BuildContext context, _ScoreItem item) {
    final val = _toDouble(item.value);
    final pct = (val / maxSectionScore).clamp(0.0, 1.0);

    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        children: [
          Row(
            children: [
              Icon(item.icon, size: 14, color: item.color),
              const SizedBox(width: 8),
              Expanded(
                child: Text(item.label,
                    style: DesignSystem.bodyStyle(buildContext: context, fontSize: 13, fontWeight: FontWeight.w600)),
              ),
              Text(
                isToefl ? val.toStringAsFixed(0) : val.toStringAsFixed(1),
                style: GoogleFonts.plusJakartaSans(
                    color: item.color, fontWeight: FontWeight.w900, fontSize: 16),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: TweenAnimationBuilder<double>(
              tween: Tween(begin: 0, end: pct),
              duration: const Duration(milliseconds: 800),
              curve: Curves.easeOutCubic,
              builder: (ctx, v, _) => LinearProgressIndicator(
                value: v,
                minHeight: 6,
                backgroundColor: DesignSystem.surface(context),
                valueColor: AlwaysStoppedAnimation(item.color),
              ),
            ),
          ),
        ],
      ),
    );
  }

  double _toDouble(dynamic v) {
    if (v == null) return 0.0;
    if (v is num) return v.toDouble();
    return double.tryParse(v.toString()) ?? 0.0;
  }
}

class _ScoreItem {
  final String label;
  final dynamic value;
  final IconData icon;
  final Color color;
  const _ScoreItem(this.label, this.value, this.icon, this.color);
}

// ─── Threshold Badge ──────────────────────────────────────────────────────────

class _ThresholdBadge extends StatelessWidget {
  final double threshold, band;
  final bool isToefl;
  const _ThresholdBadge({required this.threshold, required this.band, required this.isToefl});

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      borderColor: Colors.green.withValues(alpha: 0.4),
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.green.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(LucideIcons.award, size: 20, color: Colors.green.shade400),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Scholarship Threshold Achieved!',
                    style: GoogleFonts.inter(
                        color: Colors.green.shade400, fontWeight: FontWeight.bold, fontSize: 13)),
                const SizedBox(height: 2),
                Text(
                  'Your ${isToefl ? 'score' : 'band'} of ${isToefl ? band.toStringAsFixed(0) : band.toStringAsFixed(1)} meets the ${isToefl ? threshold.toStringAsFixed(0) : threshold.toStringAsFixed(1)}+ threshold.',
                  style: DesignSystem.labelStyle(buildContext: context, fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Feedback Card ────────────────────────────────────────────────────────────

class _FeedbackCard extends StatelessWidget {
  final String feedback;
  const _FeedbackCard({required this.feedback});

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(LucideIcons.sparkles, size: 16, color: DesignSystem.primary(context)),
              const SizedBox(width: 8),
              Text('AI Feedback Report',
                  style: DesignSystem.headingStyle(buildContext: context, fontSize: 15)),
            ],
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: DesignSystem.surface(context),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              feedback,
              style: DesignSystem.bodyStyle(buildContext: context, fontSize: 13)
                  .copyWith(height: 1.65),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Improvement Tags ─────────────────────────────────────────────────────────

class _ImprovementTags extends StatelessWidget {
  final List<String> tags;
  const _ImprovementTags({required this.tags});

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(LucideIcons.alertCircle, size: 15, color: Color(0xFFF59E0B)),
              const SizedBox(width: 8),
              Text('Areas to Improve',
                  style: DesignSystem.headingStyle(buildContext: context, fontSize: 14)),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8, runSpacing: 8,
            children: tags.map((tag) => Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFF87171).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFF87171).withValues(alpha: 0.3)),
              ),
              child: Text(
                tag.replaceAll('_', ' '),
                style: GoogleFonts.inter(
                    color: const Color(0xFFF87171), fontSize: 11, fontWeight: FontWeight.w600),
              ),
            )).toList(),
          ),
        ],
      ),
    );
  }
}

// ─── Gap Analysis Card ────────────────────────────────────────────────────────

class _GapAnalysisCard extends StatelessWidget {
  final dynamic data;
  const _GapAnalysisCard({required this.data});

  @override
  Widget build(BuildContext context) {
    final profile = data['proficiency_profile'] as String? ?? '';
    final primary = DesignSystem.primary(context);

    return GlassContainer(
      borderColor: primary.withValues(alpha: 0.25),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(LucideIcons.barChart2, size: 16, color: primary),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Competency Gap Analysis',
                      style: DesignSystem.headingStyle(buildContext: context, fontSize: 14)),
                  Text('Diagnostic Profile',
                      style: DesignSystem.labelStyle(buildContext: context, fontSize: 10)
                          .copyWith(letterSpacing: 1)),
                ],
              ),
            ],
          ),
          if (profile.isNotEmpty) ...[
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: DesignSystem.surface(context),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                '"$profile"',
                style: GoogleFonts.lora(
                    color: DesignSystem.mainText(context), fontSize: 13, fontStyle: FontStyle.italic, height: 1.5),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// ─── Curriculum Card ──────────────────────────────────────────────────────────

class _CurriculumCard extends StatelessWidget {
  final dynamic data;
  const _CurriculumCard({required this.data});

  @override
  Widget build(BuildContext context) {
    final sprints = (data['sprints'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    if (sprints.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(LucideIcons.map, size: 16, color: DesignSystem.primary(context)),
            const SizedBox(width: 8),
            Text('Post-Exam Curriculum Roadmap',
                style: DesignSystem.headingStyle(buildContext: context, fontSize: 15)),
          ],
        ),
        const SizedBox(height: 12),
        ...sprints.take(3).map((sprint) => _SprintCard(sprint: sprint)),
        if (sprints.length > 3)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Center(
              child: Text(
                'Full curriculum available in your Learning Path.',
                style: DesignSystem.labelStyle(buildContext: context, fontSize: 11)
                    .copyWith(fontStyle: FontStyle.italic),
              ),
            ),
          ),
      ],
    );
  }
}

class _SprintCard extends StatelessWidget {
  final Map<String, dynamic> sprint;
  const _SprintCard({required this.sprint});

  @override
  Widget build(BuildContext context) {
    final week = sprint['week'] ?? 1;
    final goal = sprint['goal'] as String? ?? '';
    final tasks = (sprint['tasks'] as List?)?.cast<String>() ?? [];
    final isRemedial = sprint['is_remedial'] == true;
    final primary = DesignSystem.primary(context);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      child: GlassContainer(
        borderColor: isRemedial
            ? const Color(0xFFF87171).withValues(alpha: 0.3)
            : DesignSystem.glassBorder(context),
        padding: const EdgeInsets.all(14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              children: [
                Container(
                  width: 40, height: 40,
                  decoration: BoxDecoration(
                    color: isRemedial
                        ? const Color(0xFFF87171).withValues(alpha: 0.1)
                        : primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Center(
                    child: Text('W$week',
                        style: GoogleFonts.inter(
                            color: isRemedial ? const Color(0xFFF87171) : primary,
                            fontWeight: FontWeight.bold,
                            fontSize: 12)),
                  ),
                ),
                if (isRemedial) ...[
                  const SizedBox(height: 4),
                  Text('Remedial',
                      style: GoogleFonts.inter(
                          color: const Color(0xFFF87171), fontSize: 8, fontWeight: FontWeight.bold)),
                ],
              ],
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(goal,
                      style: DesignSystem.bodyStyle(buildContext: context, fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  ...tasks.take(2).map((t) => Padding(
                    padding: const EdgeInsets.only(bottom: 3),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          margin: const EdgeInsets.only(top: 5),
                          width: 4, height: 4,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: DesignSystem.labelText(context).withValues(alpha: 0.4),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(t,
                              style: DesignSystem.labelStyle(buildContext: context, fontSize: 11)),
                        ),
                      ],
                    ),
                  )),
                  if (tasks.length > 2)
                    Text('+${tasks.length - 2} more tasks',
                        style: DesignSystem.labelStyle(buildContext: context, fontSize: 10)
                            .copyWith(fontStyle: FontStyle.italic)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
