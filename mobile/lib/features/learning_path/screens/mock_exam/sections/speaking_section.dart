import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/learning_path/providers/mock_exam_provider.dart';
import 'package:mobile/features/learning_path/models/assessment_model.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';

class SpeakingSectionWidget extends ConsumerStatefulWidget {
  const SpeakingSectionWidget({super.key});

  @override
  ConsumerState<SpeakingSectionWidget> createState() => _SpeakingSectionWidgetState();
}

class _SpeakingSectionWidgetState extends ConsumerState<SpeakingSectionWidget> with TickerProviderStateMixin {
  final AudioRecorder _recorder = AudioRecorder();
  late AnimationController _orbController;
  late AnimationController _rippleController;
  
  bool _isRecording = false;
  int _timerSeconds = 0;
  Timer? _countdownTimer;
  String? _audioPath;

  @override
  void initState() {
    super.initState();
    _orbController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500))..repeat(reverse: true);
    _rippleController = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat();
  }

  @override
  void dispose() {
    _recorder.dispose();
    _orbController.dispose();
    _rippleController.dispose();
    _countdownTimer?.cancel();
    super.dispose();
  }

  void _startToeflIntegratedFlow() {
    final state = ref.read(mockExamProvider);
    if (state.examType != 'TOEFL') return;

    // Start with Reading
    ref.read(mockExamProvider.notifier).advanceToeflStage(ToeflSubStage.reading);
    _startCountdown(45, () {
      // Transition to Listening
      ref.read(mockExamProvider.notifier).advanceToeflStage(ToeflSubStage.listening);
      // In a real app, we'd wait for the audio to finish. 
      // For this mock, we'll simulate listening for 30s or until user skips.
      _startCountdown(30, () {
        _startPrepTimer();
      });
    });
  }

  void _startCountdown(int seconds, VoidCallback onFinished) {
    setState(() => _timerSeconds = seconds);
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_timerSeconds > 0) {
        setState(() => _timerSeconds--);
      } else {
        timer.cancel();
        onFinished();
      }
    });
  }

  void _startPrepTimer() {
    ref.read(mockExamProvider.notifier).advanceToeflStage(ToeflSubStage.preparing);
    _startCountdown(15, () {
      _startSpeakTimer();
    });
  }

  void _startSpeakTimer() {
    ref.read(mockExamProvider.notifier).advanceToeflStage(ToeflSubStage.responding);
    _startRecording();
    _startCountdown(45, () {
      _stopRecording();
    });
  }

  Future<void> _startRecording() async {
    try {
      if (await _recorder.hasPermission()) {
        final dir = await getTemporaryDirectory();
        _audioPath = '${dir.path}/toefl_speaking_${DateTime.now().millisecondsSinceEpoch}.m4a';
        await _recorder.start(const RecordConfig(), path: _audioPath!);
        setState(() => _isRecording = true);
      }
    } catch (_) {}
  }

  Future<void> _stopRecording() async {
    final path = await _recorder.stop();
    setState(() => _isRecording = false);
    if (path != null) {
      final bytes = await File(path).readAsBytes();
      ref.read(mockExamProvider.notifier).updateAnswer('speaking_audio', bytes);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(mockExamProvider);
    final section = state.blueprint?.sections.speaking;
    final accent = state.primaryAccent;
    final isToefl = state.examType == 'TOEFL';

    if (section == null) return const Center(child: CircularProgressIndicator());

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        children: [
          const SizedBox(height: 20),
          if (isToefl) _buildToeflIntegratedView(section, state, accent)
          else _buildIeltsView(section, state, accent),
          const SizedBox(height: 40),
          _buildOrbArea(state, accent),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildToeflIntegratedView(SpeakingSection section, MockExamState state, Color accent) {
    return Expanded(
      child: SingleChildScrollView(
        child: Column(
          children: [
            if (state.toeflSubStage == ToeflSubStage.instruction) ...[
              _PromptCard(
                title: "INTEGRATED TASK",
                content: "You will read a passage, listen to a lecture, and then respond.",
                accent: accent,
              ),
              const SizedBox(height: 32),
              _ActionBtn(label: "BEGIN INTEGRATED FLOW", onTap: _startToeflIntegratedFlow, accent: accent),
            ] else if (state.toeflSubStage == ToeflSubStage.reading) ...[
              _PromptCard(
                title: "READING PASSAGE (45s)",
                content: section.integratedReadingText ?? section.prompt,
                accent: accent,
              ),
              const SizedBox(height: 20),
              _TimerDisplay(seconds: _timerSeconds, accent: accent),
            ] else if (state.toeflSubStage == ToeflSubStage.listening) ...[
              _PromptCard(
                title: "LISTENING TO LECTURE",
                content: "Listen carefully to the professor's opinion.",
                accent: accent,
              ),
              const SizedBox(height: 40),
              const Icon(LucideIcons.headphones, color: Colors.white24, size: 64),
              const SizedBox(height: 20),
              _TimerDisplay(seconds: _timerSeconds, accent: accent),
            ] else if (state.toeflSubStage == ToeflSubStage.preparing) ...[
              _PromptCard(
                title: "PREPARATION TIME (15s)",
                content: "Structure your response now.",
                accent: accent,
              ),
              const SizedBox(height: 20),
              _TimerDisplay(seconds: _timerSeconds, accent: Colors.amber),
            ] else if (state.toeflSubStage == ToeflSubStage.responding) ...[
              _PromptCard(
                title: "RESPONSE TIME (45s)",
                content: "State your opinion clearly.",
                accent: accent,
              ),
              const SizedBox(height: 20),
              _TimerDisplay(seconds: _timerSeconds, accent: accent),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildIeltsView(SpeakingSection section, MockExamState state, Color accent) {
    // Simplified IELTS view (reusing logic from previous implementation)
    return Expanded(
      child: Center(
        child: _PromptCard(title: "Part 1: Introduction", content: section.prompt, accent: accent),
      ),
    );
  }

  Widget _buildOrbArea(MockExamState state, Color accent) {
    final isToefl = state.examType == 'TOEFL';
    final isPrep = isToefl && state.toeflSubStage == ToeflSubStage.preparing;
    final isSpeak = state.toeflSubStage == ToeflSubStage.responding || (!isToefl && _isRecording);
    final orbColor = isPrep ? Colors.amber : (isSpeak ? accent : Colors.white10);

    return Column(
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            if (isSpeak)
              ...List.generate(3, (i) => _buildRipple(i, orbColor)),
            AnimatedBuilder(
              animation: _orbController,
              builder: (context, child) {
                return Container(
                  width: 100 + (_orbController.value * 10),
                  height: 100 + (_orbController.value * 10),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [orbColor, orbColor.withOpacity(0.7)],
                    ),
                    boxShadow: [
                      BoxShadow(color: orbColor.withOpacity(0.3), blurRadius: 20 + (_orbController.value * 10), spreadRadius: 5)
                    ],
                  ),
                  child: Icon(isSpeak ? LucideIcons.mic : LucideIcons.micOff, size: 32, color: isSpeak ? Colors.white : Colors.white24),
                );
              },
            ),
          ],
        ),
        const SizedBox(height: 20),
        Text(
          isPrep ? "CHARGING..." : (isSpeak ? "SPEAK NOW" : "WAIT FOR SIGNAL"),
          style: GoogleFonts.plusJakartaSans(color: orbColor.withOpacity(0.8), fontWeight: FontWeight.bold, letterSpacing: 2, fontSize: 12),
        ),
      ],
    );
  }

  Widget _buildRipple(int index, Color color) {
    return AnimatedBuilder(
      animation: _rippleController,
      builder: (context, child) {
        final progress = (_rippleController.value + (index * 0.33)) % 1.0;
        return Opacity(
          opacity: 1.0 - progress,
          child: Container(
            width: 100 + (progress * 150),
            height: 100 + (progress * 150),
            decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: color.withOpacity(0.2), width: 2)),
          ),
        );
      },
    );
  }
}

class _PromptCard extends StatelessWidget {
  final String title, content;
  final Color accent;
  const _PromptCard({required this.title, required this.content, required this.accent});

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: GoogleFonts.plusJakartaSans(color: accent, fontWeight: FontWeight.w800, fontSize: 11, letterSpacing: 1.5)),
          const SizedBox(height: 16),
          Text(content, style: DesignSystem.headingStyle(buildContext: context, fontSize: 18)),
        ],
      ),
    );
  }
}

class _TimerDisplay extends StatelessWidget {
  final int seconds;
  final Color accent;
  const _TimerDisplay({required this.seconds, required this.accent});

  @override
  Widget build(BuildContext context) {
    return Text(
      "$seconds s",
      style: GoogleFonts.jetBrainsMono(color: accent, fontWeight: FontWeight.bold, fontSize: 32),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final Color accent;
  const _ActionBtn({required this.label, required this.onTap, required this.accent});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: onTap,
        style: ElevatedButton.styleFrom(
          backgroundColor: accent,
          foregroundColor: Colors.black,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          padding: const EdgeInsets.symmetric(vertical: 20),
        ),
        child: Text(label, style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w900, fontSize: 14)),
      ),
    );
  }
}
