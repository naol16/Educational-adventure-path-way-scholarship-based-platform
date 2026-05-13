import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/learning_path/providers/mock_exam_provider.dart';

class MockExamBreak extends ConsumerWidget {
  const MockExamBreak({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(mockExamProvider);
    final notifier = ref.read(mockExamProvider.notifier);
    final accent = state.primaryAccent;

    final answered = state.answeredObjectiveQuestions;
    final total = state.totalObjectiveQuestions;
    final isObjective = state.currentSectionIndex < 2;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Stack(
        children: [
          // Background Glow
          Center(
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: accent.withOpacity(0.1),
                boxShadow: [
                  BoxShadow(
                    color: accent.withOpacity(0.05),
                    blurRadius: 100,
                    spreadRadius: 50,
                  )
                ],
              ),
            ),
          ),
          Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: GlassContainer(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.check_circle_outline, color: accent, size: 64),
                    const SizedBox(height: 24),
                    Text(
                      "Section Complete!",
                      style: DesignSystem.headingStyle(buildContext: context, fontSize: 24),
                    ),
                    const SizedBox(height: 12),
                    if (isObjective)
                      Text(
                        "$answered of $total questions answered.",
                        style: GoogleFonts.inter(color: Colors.white54, fontSize: 14),
                      ),
                    const SizedBox(height: 40),
                    const Divider(color: Colors.white10),
                    const SizedBox(height: 40),
                    Text(
                      "Next section starts in:",
                      style: GoogleFonts.plusJakartaSans(color: Colors.white38, fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 1),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _formatDuration(state.timeRemaining),
                      style: GoogleFonts.jetBrainsMono(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 32),
                    ),
                    const SizedBox(height: 48),
                    _PulseButton(
                      onTap: () => notifier.endBreak(),
                      label: "PROCEED NOW",
                      accent: accent,
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

  String _formatDuration(Duration d) {
    final m = d.inMinutes.toString().padLeft(2, '0');
    final s = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return "$m:$s";
  }
}

class _PulseButton extends StatefulWidget {
  final VoidCallback onTap;
  final String label;
  final Color accent;

  const _PulseButton({required this.onTap, required this.label, required this.accent});

  @override
  State<_PulseButton> createState() => _PulseButtonState();
}

class _PulseButtonState extends State<_PulseButton> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 1))..repeat(reverse: true);
    _scale = Tween<double>(begin: 1.0, end: 1.05).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _scale,
      child: SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: widget.onTap,
          style: ElevatedButton.styleFrom(
            backgroundColor: widget.accent,
            foregroundColor: Colors.black,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            padding: const EdgeInsets.symmetric(vertical: 18),
            elevation: 0,
            shadowColor: widget.accent.withOpacity(0.5),
          ),
          child: Text(
            widget.label,
            style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800, fontSize: 15, letterSpacing: 1),
          ),
        ),
      ),
    );
  }
}
