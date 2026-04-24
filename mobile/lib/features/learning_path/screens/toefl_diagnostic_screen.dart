import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/learning_path/providers/toefl_task_provider.dart';
import 'package:mobile/features/learning_path/widgets/toefl_integrated_view.dart';

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
    // Initialize first task
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(toeflTaskProvider.notifier).resetTask(
        "Modern architecture often prioritizes functionalism over aesthetic ornamentation. This movement, known as 'Less is More', emerged in the early 20th century...",
        "https://example.com/lecture.mp3"
      );
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

  void _nextStage() {
    final state = ref.read(toeflTaskProvider);
    if (state.currentStage == ToeflStage.reading) {
      ref.read(toeflTaskProvider.notifier).setStage(ToeflStage.listening, const Duration(minutes: 2));
      _startStageTimer();
    } else if (state.currentStage == ToeflStage.listening) {
      ref.read(toeflTaskProvider.notifier).setStage(ToeflStage.response, const Duration(minutes: 20));
      _startStageTimer();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return "$minutes:$seconds";
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(toeflTaskProvider);
    
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text("TOEFL Diagnostic", style: TextStyle(color: Colors.white, fontSize: 16)),
        centerTitle: true,
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 16.0),
              child: Text(
                _formatDuration(state.stageTimeRemaining),
                style: const TextStyle(color: Color(0xFF3B82F6), fontWeight: FontWeight.bold, fontFamily: 'monospace'),
              ),
            ),
          ),
        ],
      ),
      body: const SafeArea(
        child: ToeflIntegratedView(),
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(20.0),
        child: ElevatedButton(
          onPressed: _nextStage,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF3B82F6),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
          ),
          child: Text(state.currentStage == ToeflStage.response ? "Submit Response" : "Skip to Next Stage"),
        ),
      ),
    );
  }
}
