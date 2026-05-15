import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/learning_path/providers/assessment_provider.dart';
import 'package:mobile/features/learning_path/providers/toefl_task_provider.dart';
import 'package:mobile/features/learning_path/screens/assessment_result_screen.dart';

class PathfinderLoadingScreen extends ConsumerStatefulWidget {
  const PathfinderLoadingScreen({super.key});

  @override
  ConsumerState<PathfinderLoadingScreen> createState() => _PathfinderLoadingScreenState();
}

class _PathfinderLoadingScreenState extends ConsumerState<PathfinderLoadingScreen> with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  int _messageIndex = 0;
  Timer? _timer;
  Timer? _pollTimer;
  int _pollCount = 0;
  static const int _maxPolls = 60; // 3 min max (60 × 3s)
  bool _navigating = false;

  final List<String> _messages = [
    "Analyzing your responses...",
    "Comparing profile with 5,000+ scholarships...",
    "Generating your custom Mission Roadmap...",
    "Finalizing adaptive learning path...",
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat(reverse: true);

    _timer = Timer.periodic(const Duration(seconds: 2), (timer) {
      if (mounted) {
        setState(() {
          _messageIndex = (_messageIndex + 1) % _messages.length;
        });
      }
    });

    _startPolling();
  }

  void _startPolling() {
    _pollTimer = Timer.periodic(const Duration(seconds: 3), (timer) async {
      if (!mounted || _navigating) return;
      _pollCount++;

      // ── Check TOEFL provider first ──────────────────────────────────────────
      final toeflState = ref.read(toeflTaskProvider);
      if (toeflState.testId != null) {
        try {
          final result = await ref.read(assessmentProvider.notifier).pollResult(toeflState.testId!);
          if (result != null) {
            final status = result['status'];
            if (status == 'success' && mounted && !_navigating) {
              _navigating = true;
              timer.cancel();
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => const AssessmentResultScreen()),
              );
              return;
            } else if (status == 'failed') {
              timer.cancel();
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Grading failed: ${result['error'] ?? 'Unknown error'}'),
                    backgroundColor: Colors.red,
                  ),
                );
                Navigator.pop(context);
              }
              return;
            }
          }
          // Still 'processing' — keep waiting
          return;
        } catch (_) {}
      }

      // ── Check IELTS provider ────────────────────────────────────────────────
      final ieltsState = ref.read(assessmentProvider);
      if (ieltsState.testId != null) {
        await ref.read(assessmentProvider.notifier).pollResult(ieltsState.testId!);
        final updatedState = ref.read(assessmentProvider);

        if (updatedState.status == 'success' && mounted && !_navigating) {
          _navigating = true;
          timer.cancel();
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const AssessmentResultScreen()),
          );
          return;
        }
        if (updatedState.status == 'failed') {
          timer.cancel();
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Grading failed: ${updatedState.error ?? 'Unknown error'}'),
                backgroundColor: Colors.red,
              ),
            );
            Navigator.pop(context);
          }
          return;
        }
      }

      // ── Timeout ─────────────────────────────────────────────────────────────
      if (_pollCount >= _maxPolls && mounted) {
        timer.cancel();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Grading is taking longer than expected. Check your history later.'),
            backgroundColor: Colors.orange,
            duration: Duration(seconds: 5),
          ),
        );
        Navigator.pop(context);
      }
    });
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _timer?.cancel();
    _pollTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Stack(
              alignment: Alignment.center,
              children: [
                ScaleTransition(
                  scale: Tween(begin: 1.0, end: 1.2).animate(CurvedAnimation(
                    parent: _pulseController,
                    curve: Curves.easeInOut,
                  )),
                  child: Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: DesignSystem.emerald.withValues(alpha: 0.1),
                      border: Border.all(color: DesignSystem.emerald.withValues(alpha: 0.3), width: 2),
                    ),
                  ),
                ),
                const Icon(LucideIcons.sparkles, size: 48, color: DesignSystem.emerald),
              ],
            ),
            const SizedBox(height: 48),
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 500),
              child: Text(
                _messages[_messageIndex],
                key: ValueKey(_messages[_messageIndex]),
                style: GoogleFonts.inter(
                  color: DesignSystem.mainText(context),
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: 200,
              child: LinearProgressIndicator(
                backgroundColor: DesignSystem.surface(context),
                valueColor: const AlwaysStoppedAnimation(DesignSystem.emerald),
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'This may take up to 60 seconds...',
              style: GoogleFonts.inter(
                color: DesignSystem.subText(context),
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
