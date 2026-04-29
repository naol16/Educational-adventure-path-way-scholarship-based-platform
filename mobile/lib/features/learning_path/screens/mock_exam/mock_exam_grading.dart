import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/learning_path/providers/mock_exam_provider.dart';

class MockExamGrading extends ConsumerWidget {
  const MockExamGrading({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final primary = DesignSystem.primary(context);

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Animated spinner
              SizedBox(
                width: 72, height: 72,
                child: CircularProgressIndicator(
                  color: primary,
                  strokeWidth: 3,
                ),
              ),
              const SizedBox(height: 32),
              Text(
                'AI Evaluator is grading your exam',
                textAlign: TextAlign.center,
                style: DesignSystem.headingStyle(buildContext: context, fontSize: 20),
              ),
              const SizedBox(height: 12),
              Text(
                'Analyzing your responses, assessing grammar, and matching against the marking rubric...',
                textAlign: TextAlign.center,
                style: DesignSystem.labelStyle(buildContext: context, fontSize: 13)
                    .copyWith(height: 1.5),
              ),
              const SizedBox(height: 32),
              // Animated dots
              _PulsingDots(color: primary),
            ],
          ),
        ),
      ),
    );
  }
}

class _PulsingDots extends StatefulWidget {
  final Color color;
  const _PulsingDots({required this.color});

  @override
  State<_PulsingDots> createState() => _PulsingDotsState();
}

class _PulsingDotsState extends State<_PulsingDots> with TickerProviderStateMixin {
  late final List<AnimationController> _controllers;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(3, (i) {
      final c = AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 600),
      );
      Future.delayed(Duration(milliseconds: i * 200), () {
        if (mounted) c.repeat(reverse: true);
      });
      return c;
    });
  }

  @override
  void dispose() {
    for (final c in _controllers) c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(3, (i) {
        return AnimatedBuilder(
          animation: _controllers[i],
          builder: (_, __) => Container(
            margin: const EdgeInsets.symmetric(horizontal: 4),
            width: 10, height: 10,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: widget.color.withValues(alpha: 0.3 + _controllers[i].value * 0.7),
            ),
          ),
        );
      }),
    );
  }
}
