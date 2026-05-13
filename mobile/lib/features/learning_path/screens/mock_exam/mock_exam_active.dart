import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/learning_path/providers/mock_exam_provider.dart';
import 'package:mobile/features/learning_path/screens/mock_exam/sections/listening_section.dart';
import 'package:mobile/features/learning_path/screens/mock_exam/sections/reading_section.dart';
import 'package:mobile/features/learning_path/screens/mock_exam/sections/writing_section.dart';
import 'package:mobile/features/learning_path/screens/mock_exam/sections/speaking_section.dart';

class MockExamActive extends ConsumerWidget {
  const MockExamActive({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(mockExamProvider);
    final accent = state.primaryAccent;
    final isToefl = state.examType == 'TOEFL';

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(context, state, accent),
            Expanded(
              child: _buildSectionContent(state),
            ),
            _buildFooter(context, ref, state, accent),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, MockExamState state, Color accent) {
    final name = state.answers['candidateName'] ?? 'Candidate';
    final initials = name.split(' ').take(2).map((e) => e[0]).join().toUpperCase();
    final isUrgent = state.timeRemaining.inMinutes < 5;

    return Container(
      height: 80,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        border: Border(bottom: BorderSide(color: Colors.white.withOpacity(0.05))),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: accent.withOpacity(0.1),
            child: Text(initials, style: GoogleFonts.plusJakartaSans(color: accent, fontWeight: FontWeight.bold, fontSize: 14)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  state.attemptId,
                  style: GoogleFonts.plusJakartaSans(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1),
                ),
                Text(
                  state.examType == 'TOEFL' 
                      ? state.toeflSubStage.name.toUpperCase()
                      : state.sectionLabels[state.currentSectionIndex].toUpperCase(),
                  style: GoogleFonts.plusJakartaSans(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: isUrgent ? const Color(0xFFF87171).withOpacity(0.1) : Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: isUrgent ? const Color(0xFFF87171).withOpacity(0.3) : Colors.white10),
            ),
            child: Row(
              children: [
                Icon(LucideIcons.timer, color: isUrgent ? const Color(0xFFF87171) : accent, size: 16),
                const SizedBox(width: 8),
                Text(
                  _formatDuration(state.timeRemaining),
                  style: GoogleFonts.jetBrainsMono(
                    color: isUrgent ? const Color(0xFFF87171) : Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionContent(MockExamState state) {
    // TOEFL Section Order: Reading(0), Listening(1), Speaking(2), Writing(3)
    // IELTS Section Order: Listening(0), Reading(1), Writing(2), Speaking(3)
    final sectionIdx = state.currentSectionIndex;
    final isToefl = state.examType == 'TOEFL';

    if (isToefl) {
      return switch (sectionIdx) {
        0 => const ReadingSectionWidget(),
        1 => const ListeningSectionWidget(),
        2 => const SpeakingSectionWidget(),
        3 => const WritingSectionWidget(),
        _ => const SizedBox.shrink(),
      };
    } else {
      return switch (sectionIdx) {
        0 => const ListeningSectionWidget(),
        1 => const ReadingSectionWidget(),
        2 => const WritingSectionWidget(),
        3 => const SpeakingSectionWidget(),
        _ => const SizedBox.shrink(),
      };
    }
  }

  Widget _buildFooter(BuildContext context, WidgetRef ref, MockExamState state, Color accent) {
    final notifier = ref.read(mockExamProvider.notifier);
    final isToefl = state.examType == 'TOEFL';
    final isListeningOrIntegrated = state.isListening || (isToefl && state.isSpeaking);

    return Container(
      height: 100,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.05))),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Question Pill Bar
          if (state.totalObjectiveQuestions > 0)
            SizedBox(
              height: 30,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: state.totalObjectiveQuestions,
                itemBuilder: (context, index) {
                  final isCurrent = state.currentQuestionIndex == index;
                  final isAnswered = state.answers.containsKey(state.isListening ? 'L_$index' : 'R_$index');
                  final isFlagged = state.flaggedQuestions[index] ?? false;

                  return GestureDetector(
                    onTap: () => notifier.jumpToQuestion(index),
                    child: Container(
                      width: 30,
                      margin: const EdgeInsets.only(right: 6),
                      decoration: BoxDecoration(
                        color: isCurrent ? accent : (isAnswered ? accent.withOpacity(0.2) : Colors.white.withOpacity(0.05)),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: isCurrent ? accent : (isFlagged ? Colors.amber : Colors.white10)),
                      ),
                      child: Center(
                        child: Text(
                          "${index + 1}",
                          style: TextStyle(
                            color: isCurrent ? Colors.black : Colors.white54,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          const SizedBox(height: 12),
          Row(
            children: [
              _NavButton(
                icon: LucideIcons.chevronLeft,
                label: "PREV",
                onTap: (isListeningOrIntegrated) ? null : () => notifier.prevQuestion(),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: InkWell(
                  onTap: () => notifier.flagQuestion(state.currentQuestionIndex),
                  child: Container(
                    height: 44,
                    decoration: BoxDecoration(
                      color: (state.flaggedQuestions[state.currentQuestionIndex] ?? false) 
                          ? Colors.amber.withOpacity(0.1) 
                          : Colors.white.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: (state.flaggedQuestions[state.currentQuestionIndex] ?? false) 
                            ? Colors.amber 
                            : Colors.white10
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          LucideIcons.flag, 
                          size: 16, 
                          color: (state.flaggedQuestions[state.currentQuestionIndex] ?? false) ? Colors.amber : Colors.white38
                        ),
                        const SizedBox(width: 8),
                        Text(
                          "FLAG", 
                          style: GoogleFonts.plusJakartaSans(
                            color: (state.flaggedQuestions[state.currentQuestionIndex] ?? false) ? Colors.amber : Colors.white38,
                            fontWeight: FontWeight.bold,
                            fontSize: 12
                          )
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              _NavButton(
                icon: LucideIcons.chevronRight,
                label: "NEXT",
                isPrimary: true,
                accent: accent,
                onTap: () => notifier.nextQuestion(),
              ),
            ],
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

class _NavButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final bool isPrimary;
  final Color accent;

  const _NavButton({
    required this.icon,
    required this.label,
    this.onTap,
    this.isPrimary = false,
    this.accent = const Color(0xFF10B981),
  });

  @override
  Widget build(BuildContext context) {
    final color = isPrimary ? accent : Colors.white.withOpacity(0.05);
    final textColor = isPrimary ? Colors.black : Colors.white;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        height: 44,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        decoration: BoxDecoration(
          color: onTap == null ? Colors.white.withOpacity(0.02) : color,
          borderRadius: BorderRadius.circular(12),
          border: isPrimary ? null : Border.all(color: Colors.white10),
        ),
        child: Row(
          children: [
            if (!isPrimary) Icon(icon, size: 18, color: onTap == null ? Colors.white10 : textColor),
            if (!isPrimary) const SizedBox(width: 8),
            Text(
              label,
              style: GoogleFonts.plusJakartaSans(
                color: onTap == null ? Colors.white10 : textColor,
                fontWeight: FontWeight.w800,
                fontSize: 12,
              ),
            ),
            if (isPrimary) const SizedBox(width: 8),
            if (isPrimary) Icon(icon, size: 18, color: onTap == null ? Colors.white10 : textColor),
          ],
        ),
      ),
    );
  }
}
