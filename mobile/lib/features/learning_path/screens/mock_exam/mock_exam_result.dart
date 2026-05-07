import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/learning_path/providers/mock_exam_provider.dart';

class MockExamResult extends ConsumerWidget {
  const MockExamResult({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(mockExamProvider);
    final notifier = ref.read(mockExamProvider.notifier);
    final result = state.result;
    final accent = state.primaryAccent;
    final isToefl = state.examType == 'TOEFL';

    if (result == null) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    final scores = result['scores'] as Map<String, dynamic>? ?? {};
    final overall = result['overall_score'] ?? result['overall_band'] ?? 0.0;
    
    // Skill scores for Radar Chart / Scaling
    final listening = _toDouble(scores['listening'] ?? 0.0);
    final reading = _toDouble(scores['reading'] ?? 0.0);
    final writing = _toDouble(scores['writing'] ?? 0.0);
    final speaking = _toDouble(scores['speaking'] ?? 0.0);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 60),
            _ResultHeader(overall: overall, isToefl: isToefl, accent: accent),
            const SizedBox(height: 30),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                children: [
                  _RadarChartCard(listening: listening, reading: reading, writing: writing, speaking: speaking, accent: accent),
                  const SizedBox(height: 20),
                  _InsightCard(overall: overall, isToefl: isToefl, accent: accent),
                  const SizedBox(height: 20),
                  _SkillBreakdown(scores: scores, accent: accent),
                  const SizedBox(height: 40),
                  _ActionButtons(notifier: notifier, accent: accent),
                  const SizedBox(height: 60),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  double _toDouble(dynamic val) {
    if (val is int) return val.toDouble();
    if (val is double) return val;
    if (val is String) return double.tryParse(val) ?? 0.0;
    return 0.0;
  }
}

class _ResultHeader extends StatelessWidget {
  final dynamic overall;
  final bool isToefl;
  final Color accent;
  const _ResultHeader({required this.overall, required this.isToefl, required this.accent});

  @override
  Widget build(BuildContext context) {
    final maxScore = isToefl ? 120 : 9;
    
    return Column(
      children: [
        Text(
          "Performance Summary",
          style: GoogleFonts.plusJakartaSans(color: accent, fontWeight: FontWeight.w800, fontSize: 12, letterSpacing: 1),
        ),
        const SizedBox(height: 24),
        Stack(
          alignment: Alignment.center,
          children: [
            // 3D Glowing Ring Effect
            Container(
              width: 190,
              height: 190,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: accent.withOpacity(0.1), width: 10),
                boxShadow: [
                  BoxShadow(color: accent.withOpacity(0.2), blurRadius: 40, spreadRadius: 10),
                ],
              ),
            ),
            Container(
              width: 170,
              height: 170,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: SweepGradient(
                  colors: [accent, accent.withOpacity(0.3), accent],
                  stops: const [0.0, 0.5, 1.0],
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Container(
                  decoration: const BoxDecoration(color: Color(0xFF0F172A), shape: BoxShape.circle),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          overall.toString(),
                          style: GoogleFonts.plusJakartaSans(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 48),
                        ),
                        Text(
                          "/ $maxScore",
                          style: GoogleFonts.plusJakartaSans(color: Colors.white38, fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _RadarChartCard extends StatelessWidget {
  final double listening, reading, writing, speaking;
  final Color accent;

  const _RadarChartCard({required this.listening, required this.reading, required this.writing, required this.speaking, required this.accent});

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Row(
            children: [
              Icon(LucideIcons.activity, color: accent, size: 18),
              const SizedBox(width: 10),
              Text("Skill Distribution", style: GoogleFonts.plusJakartaSans(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
            ],
          ),
          const SizedBox(height: 30),
          SizedBox(
            height: 200,
            width: 200,
            child: CustomPaint(
              painter: _RadarChartPainter(
                values: [listening, reading, writing, speaking],
                labels: ['LIS', 'REA', 'WRI', 'SPE'],
                maxValue: (listening > 9) ? 30.0 : 9.0, // Scale based on score range
                accent: accent,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _RadarChartPainter extends CustomPainter {
  final List<double> values;
  final List<String> labels;
  final double maxValue;
  final Color accent;

  _RadarChartPainter({required this.values, required this.labels, required this.maxValue, required this.accent});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width / 2, size.height / 2);
    final angleStep = (2 * math.pi) / values.length;

    final gridPaint = Paint()..color = Colors.white.withOpacity(0.1)..style = PaintingStyle.stroke..strokeWidth = 1;

    for (var i = 1; i <= 3; i++) {
      final r = radius * (i / 3);
      final path = Path();
      for (var j = 0; j < values.length; j++) {
        final angle = j * angleStep - math.pi / 2;
        final x = center.dx + r * math.cos(angle);
        final y = center.dy + r * math.sin(angle);
        if (j == 0) path.moveTo(x, y); else path.lineTo(x, y);
      }
      path.close();
      canvas.drawPath(path, gridPaint);
    }

    final textPainter = TextPainter(textDirection: TextDirection.ltr);
    for (var j = 0; j < values.length; j++) {
      final angle = j * angleStep - math.pi / 2;
      final x = center.dx + radius * math.cos(angle);
      final y = center.dy + radius * math.sin(angle);
      canvas.drawLine(center, Offset(x, y), gridPaint);

      textPainter.text = TextSpan(text: labels[j], style: GoogleFonts.plusJakartaSans(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.bold));
      textPainter.layout();
      final labelX = center.dx + (radius + 15) * math.cos(angle) - textPainter.width / 2;
      final labelY = center.dy + (radius + 15) * math.sin(angle) - textPainter.height / 2;
      textPainter.paint(canvas, Offset(labelX, labelY));
    }

    final dataPaint = Paint()..color = accent.withOpacity(0.3)..style = PaintingStyle.fill;
    final borderPaint = Paint()..color = accent..style = PaintingStyle.stroke..strokeWidth = 2;

    final path = Path();
    for (var j = 0; j < values.length; j++) {
      final angle = j * angleStep - math.pi / 2;
      final r = radius * (values[j] / maxValue);
      final x = center.dx + r * math.cos(angle);
      final y = center.dy + r * math.sin(angle);
      if (j == 0) path.moveTo(x, y); else path.lineTo(x, y);
    }
    path.close();
    canvas.drawPath(path, dataPaint);
    canvas.drawPath(path, borderPaint);
    
    final pointPaint = Paint()..color = accent;
    for (var j = 0; j < values.length; j++) {
      final angle = j * angleStep - math.pi / 2;
      final r = radius * (values[j] / maxValue);
      canvas.drawCircle(Offset(center.dx + r * math.cos(angle), center.dy + r * math.sin(angle)), 3, pointPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class _InsightCard extends StatelessWidget {
  final dynamic overall;
  final bool isToefl;
  final Color accent;
  const _InsightCard({required this.overall, required this.isToefl, required this.accent});

  @override
  Widget build(BuildContext context) {
    final double score = double.tryParse(overall.toString()) ?? 0.0;
    final double max = isToefl ? 120.0 : 9.0;
    final int match = (score / max * 100).toInt().clamp(0, 100);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [accent.withOpacity(0.1), const Color(0xFF3B82F6).withOpacity(0.1)]),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: accent.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Icon(LucideIcons.sparkles, color: accent, size: 32),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("Pathfinder Insight", style: GoogleFonts.plusJakartaSans(color: accent, fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 4),
                Text("You match $match% of the Excellence scholarship requirements now!", style: GoogleFonts.inter(color: Colors.white.withOpacity(0.8), fontSize: 13, height: 1.4)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SkillBreakdown extends StatelessWidget {
  final Map<String, dynamic> scores;
  final Color accent;
  const _SkillBreakdown({required this.scores, required this.accent});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _SkillRow(label: "Reading", score: scores['reading'] ?? 0.0, icon: LucideIcons.bookOpen, accent: accent),
        _SkillRow(label: "Listening", score: scores['listening'] ?? 0.0, icon: LucideIcons.headphones, accent: accent),
        _SkillRow(label: "Speaking", score: scores['speaking'] ?? 0.0, icon: LucideIcons.mic, accent: accent),
        _SkillRow(label: "Writing", score: scores['writing'] ?? 0.0, icon: LucideIcons.penTool, accent: accent),
      ],
    );
  }
}

class _SkillRow extends StatelessWidget {
  final String label;
  final dynamic score;
  final IconData icon;
  final Color accent;

  const _SkillRow({required this.label, required this.score, required this.icon, required this.accent});

  @override
  Widget build(BuildContext context) {
    final double s = double.tryParse(score.toString()) ?? 0.0;
    String level = "Low";
    if (s >= (s > 9 ? 24 : 7.5)) level = "Advanced";
    else if (s >= (s > 9 ? 18 : 6.5)) level = "High-Intermediate";

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GlassContainer(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Icon(icon, color: Colors.white54, size: 18),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: GoogleFonts.plusJakartaSans(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
                Text(level, style: GoogleFonts.inter(color: accent.withOpacity(0.7), fontSize: 10, fontWeight: FontWeight.bold)),
              ],
            ),
            const Spacer(),
            Text(score.toString(), style: GoogleFonts.jetBrainsMono(color: accent, fontWeight: FontWeight.bold, fontSize: 16)),
          ],
        ),
      ),
    );
  }
}

class _ActionButtons extends StatelessWidget {
  final MockExamNotifier notifier;
  final Color accent;
  const _ActionButtons({required this.notifier, required this.accent});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => notifier.backToDashboard(),
            style: ElevatedButton.styleFrom(backgroundColor: accent, foregroundColor: Colors.black, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)), padding: const EdgeInsets.symmetric(vertical: 18)),
            child: Text("BACK TO MASTERY HUB", style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800, fontSize: 14)),
          ),
        ),
        const SizedBox(height: 12),
        TextButton.icon(
          onPressed: () => notifier.toggleReviewMode(),
          icon: const Icon(LucideIcons.search, size: 16, color: Colors.white54),
          label: Text("REVIEW ANSWERS", style: GoogleFonts.plusJakartaSans(color: Colors.white54, fontWeight: FontWeight.bold, fontSize: 13)),
        ),
      ],
    );
  }
}
