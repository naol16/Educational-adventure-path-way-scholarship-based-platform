import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/learning_path/providers/mock_exam_provider.dart';
import 'package:mobile/features/learning_path/screens/mock_exam/sections/reading_section.dart';
import 'package:mobile/features/learning_path/screens/mock_exam/sections/listening_section.dart';
import 'package:mobile/features/learning_path/screens/mock_exam/sections/writing_section.dart';
import 'package:mobile/features/learning_path/screens/mock_exam/sections/speaking_section.dart';

const _kSections = ['Listening', 'Reading', 'Writing', 'Speaking'];
const _kSectionIcons = [
  LucideIcons.headphones,
  LucideIcons.bookOpen,
  LucideIcons.edit3,
  LucideIcons.mic,
];

// TOEFL section order is Reading → Listening → Speaking → Writing
const _kToeflSections = ['Reading', 'Listening', 'Speaking', 'Writing'];
const _kToeflSectionIcons = [
  LucideIcons.bookOpen,
  LucideIcons.headphones,
  LucideIcons.mic,
  LucideIcons.edit3,
];

class MockExamActive extends ConsumerWidget {
  const MockExamActive({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(mockExamProvider);
    final notifier = ref.read(mockExamProvider.notifier);
    final primary = DesignSystem.primary(context);
    final isTimeLow = state.timeRemaining.inSeconds <= 120;
    final timerColor = isTimeLow ? const Color(0xFFF87171) : primary;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _confirmExit(context, notifier);
      },
      child: Scaffold(
        backgroundColor: DesignSystem.themeBackground(context),
        body: SafeArea(
          child: Column(
            children: [
              _ExamHeader(state: state, timerColor: timerColor, notifier: notifier),
              _TimerBar(state: state, timerColor: timerColor),
              _SectionTabs(state: state, notifier: notifier, primary: primary),
              Expanded(child: _SectionBody(state: state)),
              _BottomNav(state: state, notifier: notifier, primary: primary),
            ],
          ),
        ),
      ),
    );
  }

  void _confirmExit(BuildContext context, MockExamNotifier notifier) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: DesignSystem.overlayBackground(context),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Exit Exam?',
            style: DesignSystem.headingStyle(buildContext: context, fontSize: 18)),
        content: Text(
          'Your progress will be lost. Are you sure you want to exit?',
          style: DesignSystem.bodyStyle(buildContext: context, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Stay', style: TextStyle(color: DesignSystem.primary(context))),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              notifier.backToDashboard();
            },
            child: const Text('Exit', style: TextStyle(color: Color(0xFFF87171))),
          ),
        ],
      ),
    );
  }
}

// ─── Header ───────────────────────────────────────────────────────────────────

class _ExamHeader extends StatelessWidget {
  final MockExamState state;
  final Color timerColor;
  final MockExamNotifier notifier;
  const _ExamHeader({required this.state, required this.timerColor, required this.notifier});

  @override
  Widget build(BuildContext context) {
    final bp = state.blueprint;
    final examLabel = bp?.examType ?? state.examType;
    final diffLabel = bp?.difficulty ?? state.difficulty;
    final isToefl = state.examType == 'TOEFL';
    final sections = isToefl ? _kToeflSections : _kSections;
    final sectionLabel = sections[state.currentSectionIndex];
    final isTimeLow = state.timeRemaining.inSeconds <= 120;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: Row(
        children: [
          // Left: exam info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Mock Exam in Progress',
                    style: DesignSystem.headingStyle(buildContext: context, fontSize: 15)),
                Text('$examLabel · $diffLabel · $sectionLabel',
                    style: DesignSystem.labelStyle(buildContext: context, fontSize: 11)),
              ],
            ),
          ),
          // Timer
          AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: timerColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: timerColor.withValues(alpha: 0.4)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(LucideIcons.clock, size: 14, color: timerColor),
                const SizedBox(width: 6),
                Text(
                  _fmt(state.timeRemaining),
                  style: GoogleFonts.inter(
                    color: timerColor,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    fontFeatures: const [FontFeature.tabularFigures()],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          // Submit button
          ElevatedButton(
            onPressed: state.isSubmitting ? null : notifier.submitExam,
            style: ElevatedButton.styleFrom(
              backgroundColor: DesignSystem.primary(context),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 0,
            ),
            child: state.isSubmitting
                ? const SizedBox(
                    width: 14, height: 14,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(LucideIcons.checkCircle, size: 14),
                      const SizedBox(width: 4),
                      Text('Submit',
                          style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 12)),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  String _fmt(Duration d) {
    final m = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$m:$s';
  }
}

// ─── Timer Bar ────────────────────────────────────────────────────────────────

class _TimerBar extends StatelessWidget {
  final MockExamState state;
  final Color timerColor;
  const _TimerBar({required this.state, required this.timerColor});

  @override
  Widget build(BuildContext context) {
    final isToefl = state.examType == 'TOEFL';
    final sectionMinutes = isToefl ? [35, 36, 16, 29] : [30, 60, 60, 14];
    final total = sectionMinutes[state.currentSectionIndex] * 60;
    final pct = total > 0 ? state.timeRemaining.inSeconds / total : 0.0;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(4),
        child: LinearProgressIndicator(
          value: pct.clamp(0.0, 1.0),
          minHeight: 3,
          backgroundColor: DesignSystem.surface(context),
          valueColor: AlwaysStoppedAnimation(timerColor),
        ),
      ),
    );
  }
}

// ─── Section Tabs ─────────────────────────────────────────────────────────────

class _SectionTabs extends StatelessWidget {
  final MockExamState state;
  final MockExamNotifier notifier;
  final Color primary;
  const _SectionTabs({required this.state, required this.notifier, required this.primary});

  @override
  Widget build(BuildContext context) {
    final isToefl = state.examType == 'TOEFL';
    final sections = isToefl ? _kToeflSections : _kSections;
    final icons = isToefl ? _kToeflSectionIcons : _kSectionIcons;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: List.generate(sections.length, (i) {
            final isActive = state.currentSectionIndex == i;
            final isDone = state.completedSections.contains(sections[i].toLowerCase());
            return GestureDetector(
              onTap: () => notifier.goToSection(i),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                margin: const EdgeInsets.only(right: 8),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: isActive
                      ? primary
                      : isDone
                          ? const Color(0xFF10B981).withValues(alpha: 0.1)
                          : DesignSystem.surface(context),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isActive
                        ? primary
                        : isDone
                            ? const Color(0xFF10B981).withValues(alpha: 0.4)
                            : Colors.transparent,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      isDone ? LucideIcons.checkCircle : icons[i],
                      size: 13,
                      color: isActive
                          ? Colors.white
                          : isDone
                              ? const Color(0xFF10B981)
                              : DesignSystem.labelText(context),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      sections[i],
                      style: GoogleFonts.inter(
                        color: isActive
                            ? Colors.white
                            : isDone
                                ? const Color(0xFF10B981)
                                : DesignSystem.labelText(context),
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
        ),
      ),
    );
  }
}

// ─── Section Body ─────────────────────────────────────────────────────────────

class _SectionBody extends StatelessWidget {
  final MockExamState state;
  const _SectionBody({required this.state});

  @override
  Widget build(BuildContext context) {
    final isToefl = state.examType == 'TOEFL';
    // IELTS: 0=Reading, 1=Listening, 2=Writing, 3=Speaking
    // TOEFL: 0=Reading, 1=Listening, 2=Speaking, 3=Writing
    final idx = state.currentSectionIndex;

    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 220),
      child: switch (idx) {
        0 => isToefl 
            ? const ReadingSectionWidget(key: ValueKey('reading'))
            : const ListeningSectionWidget(key: ValueKey('listening')),
        1 => isToefl
            ? const ListeningSectionWidget(key: ValueKey('listening'))
            : const ReadingSectionWidget(key: ValueKey('reading')),
        2 => isToefl
            ? const SpeakingSectionWidget(key: ValueKey('speaking'))
            : const WritingSectionWidget(key: ValueKey('writing')),
        3 => isToefl
            ? const WritingSectionWidget(key: ValueKey('writing'))
            : const SpeakingSectionWidget(key: ValueKey('speaking')),
        _ => const SizedBox.shrink(),
      },
    );
  }
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────

class _BottomNav extends StatelessWidget {
  final MockExamState state;
  final MockExamNotifier notifier;
  final Color primary;
  const _BottomNav({required this.state, required this.notifier, required this.primary});

  @override
  Widget build(BuildContext context) {
    final idx = state.currentSectionIndex;
    final isLast = idx == 3;
    final isToefl = state.examType == 'TOEFL';
    // TOEFL Listening: no going back
    final canGoPrev = idx > 0 && !(isToefl && idx == 1);
    final sections = isToefl ? _kToeflSections : _kSections;

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
      decoration: BoxDecoration(
        color: DesignSystem.themeBackground(context),
        border: Border(top: BorderSide(color: DesignSystem.glassBorder(context))),
      ),
      child: Row(
        children: [
          // Previous
          OutlinedButton.icon(
            onPressed: canGoPrev ? notifier.previousSection : null,
            icon: const Icon(LucideIcons.arrowLeft, size: 14),
            label: const Text('Prev'),
            style: OutlinedButton.styleFrom(
              foregroundColor: DesignSystem.subText(context),
              side: BorderSide(color: DesignSystem.glassBorder(context)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            ),
          ),
          // Progress dots
          Expanded(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(4, (i) {
                final isActive = i == idx;
                final isDone = state.completedSections.contains(sections[i].toLowerCase());
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  width: isActive ? 20 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: isActive
                        ? primary
                        : isDone
                            ? const Color(0xFF10B981)
                            : DesignSystem.surface(context),
                    borderRadius: BorderRadius.circular(4),
                  ),
                );
              }),
            ),
          ),
          // Next / Submit
          if (!isLast)
            ElevatedButton.icon(
              onPressed: notifier.nextSection,
              icon: const Icon(LucideIcons.arrowRight, size: 14),
              label: Text(isToefl && idx == 1 ? 'Break' : 'Next'),
              style: ElevatedButton.styleFrom(
                backgroundColor: primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                elevation: 0,
              ),
            )
          else
            ElevatedButton.icon(
              onPressed: state.isSubmitting ? null : () => _confirmSubmit(context, notifier),
              icon: const Icon(LucideIcons.checkCircle, size: 14),
              label: const Text('Submit Exam'),
              style: ElevatedButton.styleFrom(
                backgroundColor: primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                elevation: 0,
              ),
            ),
        ],
      ),
    );
  }

  void _confirmSubmit(BuildContext context, MockExamNotifier notifier) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: DesignSystem.overlayBackground(context),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Submit Exam?',
            style: DesignSystem.headingStyle(buildContext: context, fontSize: 18)),
        content: Text(
          'Are you sure you want to submit your exam for AI scoring? This cannot be undone.',
          style: DesignSystem.bodyStyle(buildContext: context, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel', style: TextStyle(color: DesignSystem.labelText(context))),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              notifier.submitExam();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: DesignSystem.primary(context),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Submit'),
          ),
        ],
      ),
    );
  }
}
