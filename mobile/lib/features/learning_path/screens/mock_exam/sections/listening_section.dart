import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/learning_path/providers/mock_exam_provider.dart';
import 'package:mobile/features/learning_path/models/assessment_model.dart';
import 'package:mobile/features/learning_path/widgets/restricted_audio_player.dart';

class ListeningSectionWidget extends ConsumerStatefulWidget {
  const ListeningSectionWidget({super.key});

  @override
  ConsumerState<ListeningSectionWidget> createState() => _ListeningSectionWidgetState();
}

class _ListeningSectionWidgetState extends ConsumerState<ListeningSectionWidget> {
  bool _isAudioFinished = false;
  final TextEditingController _notesController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _notesController.text = ref.read(mockExamProvider).notes ?? '';
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(mockExamProvider);
    final section = state.blueprint?.sections.listening;
    final accent = state.primaryAccent;
    final isToefl = state.examType == 'TOEFL';

    if (section == null) return const Center(child: CircularProgressIndicator());

    final questions = section.questions;
    final currentQ = questions.isNotEmpty && state.currentQuestionIndex < questions.length
        ? questions[state.currentQuestionIndex]
        : null;

    return Column(
      children: [
        // Audio Player & Lecture Visual
        Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              if (isToefl && !_isAudioFinished)
                AspectRatio(
                  aspectRatio: 16 / 9,
                  child: GlassContainer(
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        if (section.lectureImageUrl != null)
                          Opacity(
                            opacity: 0.3,
                            child: Image.network(section.lectureImageUrl!, fit: BoxFit.cover, width: double.infinity),
                          ),
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(LucideIcons.graduationCap, color: accent.withOpacity(0.5), size: 48),
                            const SizedBox(height: 12),
                            Text("LECTURE IN PROGRESS", style: GoogleFonts.plusJakartaSans(color: accent, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 2)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              const SizedBox(height: 12),
              IELTSRestrictedAudioPlayer(
                base64Audio: section.audioBase64,
                onComplete: () => setState(() => _isAudioFinished = true),
              ),
            ],
          ),
        ),
        
        // Main Area: Notes or Questions
        Expanded(
          child: Stack(
            children: [
              // Question Area
              SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (!isToefl || _isAudioFinished) ...[
                      if (currentQ != null) ...[
                        Text(
                          "QUESTION ${state.currentQuestionIndex + 1}",
                          style: GoogleFonts.plusJakartaSans(color: accent, fontWeight: FontWeight.w800, fontSize: 12, letterSpacing: 1),
                        ),
                        const SizedBox(height: 12),
                        _buildQuestionRenderer(context, ref, currentQ, state),
                      ],
                    ] else ...[
                      const SizedBox(height: 40),
                      Center(
                        child: Column(
                          children: [
                            const Icon(LucideIcons.lock, color: Colors.white10, size: 40),
                            const SizedBox(height: 16),
                            Text(
                              "Questions will appear after the lecture.",
                              style: GoogleFonts.inter(color: Colors.white24, fontSize: 14),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 200), // Space for persistent notes
                  ],
                ),
              ),

              // Persistent Notes Area (TOEFL)
              if (isToefl)
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Colors.transparent, const Color(0xFF0F172A).withOpacity(0.95)],
                      ),
                    ),
                    child: GlassContainer(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(LucideIcons.pencil, color: accent, size: 14),
                              const SizedBox(width: 8),
                              Text("YOUR NOTES", style: GoogleFonts.plusJakartaSans(color: accent, fontWeight: FontWeight.bold, fontSize: 11)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          TextField(
                            controller: _notesController,
                            onChanged: (val) => ref.read(mockExamProvider.notifier).updateNotes(val),
                            maxLines: 3,
                            style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
                            decoration: const InputDecoration(
                              hintText: "Take notes while listening...",
                              hintStyle: TextStyle(color: Colors.white10),
                              border: InputBorder.none,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildQuestionRenderer(BuildContext context, WidgetRef ref, AssessmentQuestion q, MockExamState state) {
    return switch (q.type) {
      QuestionType.form => _FormRenderer(q: q, state: state, ref: ref),
      QuestionType.map => _MapRenderer(q: q, state: state, ref: ref),
      _ => _MCQRenderer(q: q, state: state, ref: ref),
    };
  }
}

class _MCQRenderer extends StatelessWidget {
  final AssessmentQuestion q;
  final MockExamState state;
  final WidgetRef ref;

  const _MCQRenderer({required this.q, required this.state, required this.ref});

  @override
  Widget build(BuildContext context) {
    final selected = state.answers['L_${q.id}'];
    final accent = state.primaryAccent;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(q.question, style: DesignSystem.headingStyle(buildContext: context, fontSize: 18)),
        const SizedBox(height: 24),
        ...q.options.map((opt) {
          final isSelected = selected == opt;
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: InkWell(
              onTap: () => ref.read(mockExamProvider.notifier).updateAnswer('L_${q.id}', opt),
              borderRadius: BorderRadius.circular(16),
              child: GlassContainer(
                padding: const EdgeInsets.all(16),
                borderColor: isSelected ? accent : null,
                child: Row(
                  children: [
                    Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: isSelected ? accent : Colors.white24, width: 2),
                        color: isSelected ? accent : Colors.transparent,
                      ),
                      child: isSelected ? const Icon(Icons.check, size: 14, color: Colors.black) : null,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Text(opt, style: GoogleFonts.inter(color: Colors.white, fontSize: 15)),
                    ),
                  ],
                ),
              ),
            ),
          );
        }),
      ],
    );
  }
}

class _FormRenderer extends StatelessWidget {
  final AssessmentQuestion q;
  final MockExamState state;
  final WidgetRef ref;

  const _FormRenderer({required this.q, required this.state, required this.ref});

  @override
  Widget build(BuildContext context) {
    final accent = state.primaryAccent;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(q.question, style: DesignSystem.headingStyle(buildContext: context, fontSize: 18)),
        const SizedBox(height: 24),
        TextField(
          onChanged: (val) => ref.read(mockExamProvider.notifier).updateAnswer('L_${q.id}', val),
          style: GoogleFonts.inter(color: Colors.white, fontSize: 16),
          decoration: InputDecoration(
            hintText: "Type your answer...",
            hintStyle: const TextStyle(color: Colors.white24),
            enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white.withOpacity(0.2))),
            focusedBorder: BorderSide(color: accent).padding(bottom: 2),
          ),
        ),
      ],
    );
  }
}

class _MapRenderer extends StatelessWidget {
  final AssessmentQuestion q;
  final MockExamState state;
  final WidgetRef ref;

  const _MapRenderer({required this.q, required this.state, required this.ref});

  @override
  Widget build(BuildContext context) {
    final selected = state.answers['L_${q.id}'];
    final accent = state.primaryAccent;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(q.question, style: DesignSystem.headingStyle(buildContext: context, fontSize: 18)),
        const SizedBox(height: 20),
        if (q.imageUrl != null)
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Image.network(q.imageUrl!, width: double.infinity, fit: BoxFit.cover),
          ),
        const SizedBox(height: 24),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: q.options.map((opt) {
            final isSelected = selected == opt;
            return ChoiceChip(
              label: Text(opt),
              selected: isSelected,
              onSelected: (val) {
                if (val) ref.read(mockExamProvider.notifier).updateAnswer('L_${q.id}', opt);
              },
              backgroundColor: Colors.white.withOpacity(0.05),
              selectedColor: accent,
              labelStyle: TextStyle(color: isSelected ? Colors.black : Colors.white),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            );
          }).toList(),
        ),
      ],
    );
  }
}

extension PaddingExtension on BorderSide {
  UnderlineInputBorder padding({double bottom = 0}) => UnderlineInputBorder(borderSide: this);
}
