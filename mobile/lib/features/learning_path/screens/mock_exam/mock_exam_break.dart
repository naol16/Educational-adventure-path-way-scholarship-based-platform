import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/learning_path/providers/mock_exam_provider.dart';

class MockExamBreak extends ConsumerWidget {
  const MockExamBreak({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final timeRemaining = ref.watch(mockExamProvider.select((s) => s.timeRemaining));
    final notifier = ref.read(mockExamProvider.notifier);
    final primary = DesignSystem.primary(context);

    final minutes = timeRemaining.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = timeRemaining.inSeconds.remainder(60).toString().padLeft(2, '0');
    final isAlmostOver = timeRemaining.inSeconds <= 60;

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: Stack(
        children: [
          Positioned(
            top: -60, left: -40,
            child: DesignSystem.buildBlurCircle(primary.withValues(alpha: 0.06), 260),
          ),
          SafeArea(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Icon
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: primary.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(LucideIcons.coffee, size: 40, color: primary),
                    ),
                    const SizedBox(height: 24),

                    Text(
                      '10-Minute Break',
                      style: DesignSystem.headingStyle(buildContext: context, fontSize: 26),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Stand up, hydrate. The clock pauses during this break only.',
                      textAlign: TextAlign.center,
                      style: DesignSystem.labelStyle(buildContext: context, fontSize: 13)
                          .copyWith(height: 1.5),
                    ),
                    const SizedBox(height: 40),

                    // Big countdown
                    GlassContainer(
                      padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 28),
                      child: Column(
                        children: [
                          Text(
                            '$minutes:$seconds',
                            style: GoogleFonts.inter(
                              color: isAlmostOver ? const Color(0xFFF87171) : primary,
                              fontSize: 56,
                              fontWeight: FontWeight.w900,
                              fontFeatures: const [FontFeature.tabularFigures()],
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'remaining',
                            style: DesignSystem.labelStyle(buildContext: context, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Tips
                    GlassContainer(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          _TipRow(icon: LucideIcons.droplets, text: 'Drink some water'),
                          const SizedBox(height: 10),
                          _TipRow(icon: LucideIcons.activity, text: 'Stretch your neck and shoulders'),
                          const SizedBox(height: 10),
                          _TipRow(icon: LucideIcons.eye, text: 'Rest your eyes — look at something distant'),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Skip break button
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: notifier.endBreak,
                        icon: const Icon(LucideIcons.skipForward, size: 16),
                        label: const Text('End Break Early — Begin Speaking'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: primary,
                          side: BorderSide(color: primary.withValues(alpha: 0.5)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Next section: Speaking (16 min)',
                      style: DesignSystem.labelStyle(buildContext: context, fontSize: 11),
                    ),
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

class _TipRow extends StatelessWidget {
  final IconData icon;
  final String text;
  const _TipRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 15, color: DesignSystem.primary(context)),
        const SizedBox(width: 10),
        Text(text, style: DesignSystem.bodyStyle(buildContext: context, fontSize: 13)),
      ],
    );
  }
}
