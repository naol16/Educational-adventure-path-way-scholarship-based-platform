import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/learning_path/providers/mock_exam_provider.dart';

class MockExamDashboard extends ConsumerWidget {
  const MockExamDashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(mockExamProvider);
    final notifier = ref.read(mockExamProvider.notifier);
    final primary = DesignSystem.primary(context);

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: Stack(
        children: [
          Positioned(
            top: -80, right: -60,
            child: DesignSystem.buildBlurCircle(primary.withValues(alpha: 0.07), 280),
          ),
          SafeArea(
            child: RefreshIndicator(
              onRefresh: notifier.loadHistory,
              color: primary,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _Header(),
                    const SizedBox(height: 24),
                    _StatsRow(state: state),
                    const SizedBox(height: 24),
                    _GenerateCard(state: state, notifier: notifier),
                    const SizedBox(height: 28),
                    _HistorySection(state: state),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Header ──────────────────────────────────────────────────────────────────

class _Header extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: DesignSystem.primary(context).withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(LucideIcons.bookOpen, color: DesignSystem.primary(context), size: 22),
        ),
        const SizedBox(width: 14),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Mock Exam', style: DesignSystem.headingStyle(buildContext: context, fontSize: 22)),
            Text('AI-powered full assessment',
                style: DesignSystem.labelStyle(buildContext: context, fontSize: 12)),
          ],
        ),
      ],
    );
  }
}

// ─── Stats Row ────────────────────────────────────────────────────────────────

class _StatsRow extends StatelessWidget {
  final MockExamState state;
  const _StatsRow({required this.state});

  @override
  Widget build(BuildContext context) {
    final isToefl = state.examType == 'TOEFL';
    final maxScore = isToefl ? 120.0 : 9.0;
    final threshold = isToefl ? 90.0 : 6.5;
    final filtered = state.progressHistory.where((h) => (h['examType'] ?? '') == state.examType).toList();
    final bands = filtered.map((h) => _toDouble(h['overallBand'])).toList();
    final avg = bands.isEmpty ? 0.0 : bands.reduce((a, b) => a + b) / bands.length;
    final best = bands.isEmpty ? 0.0 : bands.reduce((a, b) => a > b ? a : b);
    final pct = (avg / maxScore).clamp(0.0, 1.0);
    final primary = DesignSystem.primary(context);

    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _StatCard(
                label: isToefl ? 'Avg Score' : 'Avg Band',
                value: isToefl ? avg.toStringAsFixed(0) : avg.toStringAsFixed(1),
                sub: 'Best: ${isToefl ? best.toStringAsFixed(0) : best.toStringAsFixed(1)}',
                icon: LucideIcons.target,
                iconColor: primary,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _StatCard(
                label: 'Tests Taken',
                value: '${filtered.length}',
                sub: 'Keep practicing',
                icon: LucideIcons.trendingUp,
                iconColor: Colors.blue,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        GlassContainer(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(LucideIcons.award, size: 15, color: primary),
                  const SizedBox(width: 8),
                  Text('Scholarship Goal',
                      style: DesignSystem.labelStyle(buildContext: context, fontSize: 12)
                          .copyWith(fontWeight: FontWeight.bold)),
                  const Spacer(),
                  Text('Target: ${isToefl ? threshold.toStringAsFixed(0) : '${threshold.toStringAsFixed(1)}+'}',
                      style: DesignSystem.labelStyle(buildContext: context, fontSize: 11)),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Your average', style: DesignSystem.labelStyle(buildContext: context, fontSize: 11)),
                  Text(
                    '${isToefl ? avg.toStringAsFixed(0) : avg.toStringAsFixed(1)} / ${isToefl ? '120' : '9.0'}',
                    style: DesignSystem.bodyStyle(buildContext: context, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0, end: pct),
                  duration: const Duration(milliseconds: 900),
                  builder: (ctx, val, _) => LinearProgressIndicator(
                    value: val,
                    minHeight: 8,
                    backgroundColor: DesignSystem.surface(context),
                    valueColor: AlwaysStoppedAnimation(primary),
                  ),
                ),
              ),
              if (avg >= threshold) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(LucideIcons.sparkles, size: 12, color: Colors.green.shade400),
                    const SizedBox(width: 4),
                    Text('Threshold achieved!',
                        style: GoogleFonts.inter(
                            color: Colors.green.shade400, fontSize: 11, fontWeight: FontWeight.w600)),
                  ],
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  double _toDouble(dynamic v) {
    if (v == null) return 0.0;
    if (v is num) return v.toDouble();
    return double.tryParse(v.toString()) ?? 0.0;
  }
}

class _StatCard extends StatelessWidget {
  final String label, value, sub;
  final IconData icon;
  final Color iconColor;
  const _StatCard({required this.label, required this.value, required this.sub, required this.icon, required this.iconColor});

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: DesignSystem.labelStyle(buildContext: context, fontSize: 11)),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, size: 15, color: iconColor),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(value,
              style: DesignSystem.headingStyle(buildContext: context, fontSize: 28)
                  .copyWith(color: DesignSystem.primary(context))),
          const SizedBox(height: 4),
          Text(sub, style: DesignSystem.labelStyle(buildContext: context, fontSize: 10)),
        ],
      ),
    );
  }
}

// ─── Generate Card ────────────────────────────────────────────────────────────

class _GenerateCard extends StatelessWidget {
  final MockExamState state;
  final MockExamNotifier notifier;
  const _GenerateCard({required this.state, required this.notifier});

  @override
  Widget build(BuildContext context) {
    final primary = DesignSystem.primary(context);

    return GlassContainer(
      borderRadius: 20,
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(LucideIcons.playCircle, color: primary, size: 20),
              const SizedBox(width: 8),
              Text('Start New Exam',
                  style: DesignSystem.headingStyle(buildContext: context, fontSize: 16)),
            ],
          ),
          const SizedBox(height: 4),
          Text('Configure your mock assessment below.',
              style: DesignSystem.labelStyle(buildContext: context, fontSize: 12)),
          const SizedBox(height: 20),

          // Exam Type
          Text('Exam Type',
              style: DesignSystem.labelStyle(buildContext: context, fontSize: 11)
                  .copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Row(
            children: ['IELTS', 'TOEFL'].map((t) {
              final sel = state.examType == t;
              return Expanded(
                child: GestureDetector(
                  onTap: () => notifier.setExamType(t),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    margin: EdgeInsets.only(right: t == 'IELTS' ? 8 : 0),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: sel ? primary : DesignSystem.surface(context),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: sel ? primary : DesignSystem.glassBorder(context)),
                    ),
                    child: Center(
                      child: Text(t,
                          style: GoogleFonts.inter(
                              color: sel ? Colors.white : DesignSystem.subText(context),
                              fontWeight: FontWeight.bold,
                              fontSize: 14)),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),

          // Difficulty
          Text('Difficulty',
              style: DesignSystem.labelStyle(buildContext: context, fontSize: 11)
                  .copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Row(
            children: [
              _DiffBtn(label: 'Easy', color: const Color(0xFF10B981), state: state, notifier: notifier),
              const SizedBox(width: 8),
              _DiffBtn(label: 'Medium', color: const Color(0xFFF59E0B), state: state, notifier: notifier),
              const SizedBox(width: 8),
              _DiffBtn(label: 'Hard', color: const Color(0xFFF87171), state: state, notifier: notifier),
            ],
          ),
          const SizedBox(height: 16),

          // Learning path error
          if (state.learningPathError != null) ...[
            _ErrorBanner(
              icon: LucideIcons.lock,
              title: 'Mock Exam Locked',
              message: state.learningPathError!,
            ),
            const SizedBox(height: 12),
          ],

          // General error
          if (state.error != null) ...[
            _ErrorBanner(
              icon: LucideIcons.alertCircle,
              title: 'Error',
              message: state.error!,
            ),
            const SizedBox(height: 12),
          ],

          // Generate button
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: state.isGenerating ? null : notifier.generateExam,
              style: ElevatedButton.styleFrom(
                backgroundColor: primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
              child: state.isGenerating
                  ? Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const SizedBox(
                          width: 16, height: 16,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        ),
                        const SizedBox(width: 10),
                        Text('Generating Exam...',
                            style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 14)),
                      ],
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(LucideIcons.sparkles, size: 16),
                        const SizedBox(width: 8),
                        Text('Generate Assessment',
                            style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 15)),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DiffBtn extends StatelessWidget {
  final String label;
  final Color color;
  final MockExamState state;
  final MockExamNotifier notifier;
  const _DiffBtn({required this.label, required this.color, required this.state, required this.notifier});

  @override
  Widget build(BuildContext context) {
    final sel = state.difficulty == label;
    return Expanded(
      child: GestureDetector(
        onTap: () => notifier.setDifficulty(label),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: sel ? color : DesignSystem.surface(context),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: sel ? color : DesignSystem.glassBorder(context)),
          ),
          child: Center(
            child: Text(label,
                style: GoogleFonts.inter(
                    color: sel ? Colors.white : DesignSystem.subText(context),
                    fontWeight: FontWeight.bold,
                    fontSize: 12)),
          ),
        ),
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  final IconData icon;
  final String title, message;
  const _ErrorBanner({required this.icon, required this.title, required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF87171).withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFF87171).withValues(alpha: 0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: const Color(0xFFF87171), size: 16),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: GoogleFonts.inter(
                        color: const Color(0xFFF87171), fontWeight: FontWeight.bold, fontSize: 12)),
                const SizedBox(height: 3),
                Text(message,
                    style: GoogleFonts.inter(
                        color: DesignSystem.subText(context), fontSize: 11, height: 1.4)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── History Section ──────────────────────────────────────────────────────────

class _HistorySection extends StatelessWidget {
  final MockExamState state;
  const _HistorySection({required this.state});

  @override
  Widget build(BuildContext context) {
    final primary = DesignSystem.primary(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Assessment History',
            style: DesignSystem.headingStyle(buildContext: context, fontSize: 16)),
        const SizedBox(height: 12),
        if (state.isLoadingHistory)
          Center(child: Padding(
            padding: const EdgeInsets.all(32),
            child: CircularProgressIndicator(color: primary),
          ))
        else if (state.progressHistory.isEmpty)
          GlassContainer(
            padding: const EdgeInsets.all(32),
            child: Center(
              child: Column(
                children: [
                  Icon(LucideIcons.clipboardList, size: 40,
                      color: DesignSystem.labelText(context).withValues(alpha: 0.25)),
                  const SizedBox(height: 12),
                  Text('No assessments yet',
                      style: DesignSystem.bodyStyle(buildContext: context, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  Text('Generate your first exam to start tracking progress.',
                      textAlign: TextAlign.center,
                      style: DesignSystem.labelStyle(buildContext: context, fontSize: 12)),
                ],
              ),
            ),
          )
        else
          ...state.progressHistory.reversed.map((item) => _HistoryItem(item: item)),
      ],
    );
  }
}

class _HistoryItem extends StatelessWidget {
  final Map<String, dynamic> item;
  const _HistoryItem({required this.item});

  @override
  Widget build(BuildContext context) {
    final band = _toDouble(item['overallBand']);
    final examType = item['examType'] ?? 'IELTS';
    final difficulty = item['difficulty'] ?? 'Medium';
    final createdAt = item['createdAt'] as String? ?? '';
    final isToefl = examType == 'TOEFL';
    final primary = DesignSystem.primary(context);

    final diffColor = switch (difficulty) {
      'Hard' => const Color(0xFFF87171),
      'Easy' => const Color(0xFF10B981),
      _ => const Color(0xFFF59E0B),
    };

    String dateStr = '';
    try {
      final dt = DateTime.parse(createdAt);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      dateStr = '${months[dt.month - 1]} ${dt.day}, ${dt.year}';
    } catch (_) {}

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      child: GlassContainer(
        borderRadius: 14,
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Container(
              width: 48, height: 48,
              decoration: BoxDecoration(
                color: primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(
                child: Text(
                  isToefl ? band.toStringAsFixed(0) : band.toStringAsFixed(1),
                  style: GoogleFonts.plusJakartaSans(
                      color: primary, fontWeight: FontWeight.w900, fontSize: 13),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(examType,
                          style: DesignSystem.bodyStyle(
                              buildContext: context, fontWeight: FontWeight.bold, fontSize: 13)),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: diffColor.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(difficulty,
                            style: GoogleFonts.inter(
                                color: diffColor, fontSize: 10, fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(dateStr, style: DesignSystem.labelStyle(buildContext: context, fontSize: 11)),
                ],
              ),
            ),
            Icon(LucideIcons.chevronRight, size: 16, color: DesignSystem.labelText(context)),
          ],
        ),
      ),
    );
  }

  double _toDouble(dynamic v) {
    if (v == null) return 0.0;
    if (v is num) return v.toDouble();
    return double.tryParse(v.toString()) ?? 0.0;
  }
}
