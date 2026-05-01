import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/learning_path/providers/toefl_task_provider.dart';
import 'package:mobile/features/learning_path/widgets/toefl_integrated_view.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/learning_path/screens/assessment_result_screen.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:google_fonts/google_fonts.dart';


class ToeflDiagnosticScreen extends ConsumerStatefulWidget {
  const ToeflDiagnosticScreen({super.key});

  @override
  ConsumerState<ToeflDiagnosticScreen> createState() => _ToeflDiagnosticScreenState();
}

class _ToeflDiagnosticScreenState extends ConsumerState<ToeflDiagnosticScreen> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(toeflTaskProvider.notifier).generateTask(force: true);
      _startStageTimer();
    });
  }

  void _startStageTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      final state = ref.read(toeflTaskProvider);
      if (state.stageTimeRemaining.inSeconds <= 0) {
        _timer?.cancel();
        _nextStage();
      } else {
        ref.read(toeflTaskProvider.notifier).updateTimer(
          state.stageTimeRemaining - const Duration(seconds: 1),
        );
      }
    });
  }

  Future<void> _nextStage() async {
    final state = ref.read(toeflTaskProvider);
    final skillMap = {
      ToeflStage.reading: 'reading',
      ToeflStage.listening: 'listening',
      ToeflStage.writing: 'writing',
      ToeflStage.speaking: 'speaking',
    };
    final skill = skillMap[state.currentStage]!;
    
    // Submit current section before moving
    _timer?.cancel();
    await ref.read(toeflTaskProvider.notifier).submitSection(skill);
    
    if (mounted) {
      _showSectionResultOverlay(skill);
    }
  }

  void _showSectionResultOverlay(String skill) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Consumer(
        builder: (context, ref, _) {
          final state = ref.watch(toeflTaskProvider);
          final score = state.sectionalScores[skill];
          if (kDebugMode) {
            print("[ToeflDiagnosticScreen] Overlay for $skill. Score in state: $score");
          }
          final feedback = state.lastSectionResult?['feedback'] ?? (score != null ? "Ready for the next challenge?" : "Awaiting evaluation...");
          final isZero = score == 0;

          return Dialog(
            backgroundColor: Colors.transparent,
            child: GlassContainer(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    "${skill.toUpperCase()} COMPLETED",
                    style: DesignSystem.headingStyle(buildContext: context, fontSize: 18, color: const Color(0xFF3B82F6)),
                  ),
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: isZero ? Colors.red : const Color(0xFF3B82F6), width: 2),
                    ),
                    child: Column(
                      children: [
                        Text("Score", style: DesignSystem.labelStyle(buildContext: context)),
                        Text(
                          score?.toStringAsFixed(0) ?? "--",
                          style: DesignSystem.headingStyle(buildContext: context, fontSize: 32).copyWith(
                            color: isZero ? Colors.red : Colors.white,
                          ),
                        ),
                        Text("/30", style: DesignSystem.labelStyle(buildContext: context, fontSize: 12)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    feedback,
                    style: DesignSystem.bodyStyle(buildContext: context, fontSize: 14).copyWith(
                      color: isZero ? Colors.white60 : Colors.white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  PrimaryButton(
                    text: skill == 'speaking' ? "VIEW FINAL RESULTS" : "CONTINUE",
                    onPressed: () {
                      Navigator.pop(context);
                      if (skill == 'reading') {
                        ref.read(toeflTaskProvider.notifier).setStage(ToeflStage.listening, const Duration(minutes: 2));
                        _startStageTimer();
                      } else if (skill == 'listening') {
                        ref.read(toeflTaskProvider.notifier).setStage(ToeflStage.writing, const Duration(minutes: 20));
                        _startStageTimer();
                      } else if (skill == 'writing') {
                        ref.read(toeflTaskProvider.notifier).setStage(ToeflStage.speaking, const Duration(minutes: 2));
                        _startStageTimer();
                      } else {
                        // Finished speaking, go to final results
                        _showGradingOverlay();
                      }
                    },
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }


  void _showGradingOverlay() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Dialog(
          backgroundColor: Colors.transparent,
          child: GlassContainer(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const CircularProgressIndicator(color: Color(0xFF3B82F6)),
                const SizedBox(height: 24),
                Text(
                  "AI is Grading Your TOEFL Response",
                  style: DesignSystem.headingStyle(buildContext: context, fontSize: 18),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                Text(
                  "Analyzing coherence, integrated reasoning, and language use...",
                  style: DesignSystem.bodyStyle(buildContext: context, fontSize: 14),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      
    );

    // Start polling or wait for result
    _checkResult();
  }

  void _checkResult() async {
    while (mounted) {
      final state = ref.read(toeflTaskProvider);
      if (state.result != null) {
        // ignore: use_build_context_synchronously
        Navigator.pop(context); // Close dialog
        Navigator.pushReplacement(
          // ignore: use_build_context_synchronously
          context,
          MaterialPageRoute(builder: (context) => const AssessmentResultScreen()),
        );
        break;
      }
      if (state.error != null) {
        // ignore: use_build_context_synchronously
        Navigator.pop(context);
        // ignore: use_build_context_synchronously
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: ${state.error}")));
        break;
      }
      await Future.delayed(const Duration(seconds: 2));
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }


  String _formatTime(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return "$minutes:$seconds";
  }

  void _showExitConfirmation() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: Text("Exit Assessment?", style: DesignSystem.headingStyle(buildContext: context, fontSize: 18)),
        content: Text("Your progress will be lost. Are you sure you want to exit?", style: DesignSystem.labelStyle(buildContext: context)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("CANCEL", style: TextStyle(color: Colors.white70)),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Close dialog
              Navigator.pop(context); // Exit screen
            },
            child: const Text("EXIT", style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(ToeflTaskState state) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: const Icon(LucideIcons.x, color: Colors.white),
            onPressed: _showExitConfirmation,
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white10),
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.clock, size: 16, color: Color(0xFF3B82F6)),
                const SizedBox(width: 8),
                Text(
                  _formatTime(state.stageTimeRemaining),
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressBar(ToeflTaskState state) {
    final stages = ToeflStage.values;
    final currentIndex = stages.indexOf(state.currentStage);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      child: Row(
        children: List.generate(stages.length, (index) {
          final isActive = index == currentIndex;
          final isCompleted = index < currentIndex;
          final color = isCompleted 
              ? const Color(0xFF3B82F6) 
              : isActive 
                  ? const Color(0xFF3B82F6) 
                  : const Color(0xFF1E293B);
                  
          return Expanded(
            child: Container(
              margin: EdgeInsets.only(right: index == stages.length - 1 ? 0 : 8),
              height: 6,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(3),
              ),
            ),
          );
        }),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(toeflTaskProvider);

    if (state.isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFF0F172A),
        body: Center(child: CircularProgressIndicator(color: Color(0xFF3B82F6))),
      );
    }

    if (state.error != null && state.testId == null) {
      return Scaffold(
        backgroundColor: const Color(0xFF0F172A),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text("Error: ${state.error}", style: const TextStyle(color: Colors.white70)),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.read(toeflTaskProvider.notifier).generateTask(force: true),
                child: const Text("Retry"),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Stack(
        children: [
          Positioned(
            top: -100,
            left: -50,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF3B82F6).withValues(alpha: 0.05),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF3B82F6).withValues(alpha: 0.05),
                    blurRadius: 100,
                    spreadRadius: 50,
                  ),
                ],
              ),
            ),
          ),
          
          SafeArea(
            child: Column(
              children: [
                _buildHeader(state),
                _buildProgressBar(state),
                const Expanded(
                  child: ToeflIntegratedView(),
                ),
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: state.isSubmitting 
                    ? const SizedBox(height: 50, child: Center(child: CircularProgressIndicator(color: Color(0xFF3B82F6))))
                    : PrimaryButton(
                        text: state.currentStage == ToeflStage.speaking ? "FINISH ASSESSMENT" : "CONTINUE TO NEXT SECTION",
                        onPressed: _nextStage,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
