import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/learning_path/providers/mock_exam_provider.dart';
import 'package:mobile/features/learning_path/screens/mock_exam/listening_section.dart';
import 'package:mobile/features/learning_path/screens/mock_exam/reading_section.dart';
import 'package:mobile/features/learning_path/screens/mock_exam/writing_section.dart';
import 'package:mobile/features/learning_path/screens/mock_exam/speaking_section.dart';

class MockExamScreen extends ConsumerStatefulWidget {
  const MockExamScreen({super.key});

  @override
  ConsumerState<MockExamScreen> createState() => _MockExamScreenState();
}

class _MockExamScreenState extends ConsumerState<MockExamScreen> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      final state = ref.read(mockExamProvider);
      if (state.timeRemaining.inSeconds <= 0) {
        _timer?.cancel();
        _autoSubmit();
      } else {
        ref.read(mockExamProvider.notifier).updateTimer(
              state.timeRemaining - const Duration(seconds: 1),
            );
      }
    });
  }

  void _autoSubmit() {
    ref.read(mockExamProvider.notifier).submitFullExam();
    // Navigate to results or show submission dialog
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final hours = twoDigits(duration.inHours);
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return "$hours:$minutes:$seconds";
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(mockExamProvider);
    final sections = [
      const ListeningSection(),
      const ReadingSection(),
      const WritingSection(),
      const SpeakingSection(),
    ];

    final isLowTime = state.timeRemaining.inMinutes < 10;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A), // Dark slate background
      body: SafeArea(
        child: Column(
          children: [
            // Top Ribbon / Progress & Timer
            _buildTopBar(state, isLowTime),

            // Section Switcher Ribbon
            _buildSectionRibbon(state.currentSectionIndex),

            // Exam Content
            Expanded(
              child: IndexedStack(
                index: state.currentSectionIndex,
                children: sections,
              ),
            ),
            
            // Navigation Buttons
            _buildNavigationFooter(state),
          ],
        ),
      ),
    );
  }

  Widget _buildTopBar(MockExamState state, bool isLowTime) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            "IELTS Standard Mock Exam",
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              // ignore: deprecated_member_use
              color: isLowTime ? Colors.redAccent.withOpacity(0.2) : Colors.white.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isLowTime ? Colors.redAccent : Colors.white30,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.timer,
                  color: isLowTime ? Colors.redAccent : Colors.white70,
                  size: 18,
                ),
                const SizedBox(width: 8),
                Text(
                  _formatDuration(state.timeRemaining),
                  style: TextStyle(
                    color: isLowTime ? Colors.redAccent : Colors.white,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionRibbon(int currentIndex) {
    final sectionNames = ["LISTENING", "READING", "WRITING", "SPEAKING"];
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Row(
        children: List.generate(sectionNames.length, (index) {
          final isActive = index == currentIndex;
          final isCompleted = index < currentIndex;
          return Expanded(
            child: Column(
              children: [
                Text(
                  sectionNames[index],
                  style: TextStyle(
                    color: isActive ? const Color(0xFF10B981) : Colors.white38,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  height: 4,
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  decoration: BoxDecoration(
                    color: isActive
                        ? const Color(0xFF10B981)
                        // ignore: deprecated_member_use
                        : (isCompleted ? const Color(0xFF10B981).withOpacity(0.5) : Colors.white10),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ],
            ),
          );
        }),
      ),
    );
  }

  Widget _buildNavigationFooter(MockExamState state) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          if (state.currentSectionIndex > 0)
            TextButton(
              onPressed: () => ref.read(mockExamProvider.notifier).previousSection(),
              child: const Text("Previous Section", style: TextStyle(color: Colors.white70)),
            )
          else
            const SizedBox.shrink(),
          
          ElevatedButton(
            onPressed: () {
              if (state.currentSectionIndex < 3) {
                ref.read(mockExamProvider.notifier).nextSection();
              } else {
                _confirmSubmit();
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF10B981),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: Text(state.currentSectionIndex < 3 ? "Next Section" : "Submit Exam"),
          ),
        ],
      ),
    );
  }

  void _confirmSubmit() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text("Finish Exam?", style: TextStyle(color: Colors.white)),
        content: const Text("Are you sure you want to submit your exam for scoring?", style: TextStyle(color: Colors.white70)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _autoSubmit();
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
            child: const Text("Submit"),
          ),
        ],
      ),
    );
  }
}
