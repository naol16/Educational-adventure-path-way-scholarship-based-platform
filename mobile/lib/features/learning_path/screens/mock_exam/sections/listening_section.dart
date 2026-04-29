import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/learning_path/models/assessment_model.dart';
import 'package:mobile/features/learning_path/providers/mock_exam_provider.dart';
import 'package:mobile/features/learning_path/widgets/restricted_audio_player.dart';

class ListeningSectionWidget extends ConsumerWidget {
  const ListeningSectionWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(mockExamProvider);
    final notifier = ref.read(mockExamProvider.notifier);
    final listening = state.blueprint?.sections.listening;

    if (listening == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(LucideIcons.headphones, size: 48, color: DesignSystem.labelText(context).withValues(alpha: 0.3)),
            const SizedBox(height: 12),
            Text('Listening section not available.', style: DesignSystem.labelStyle(buildContext: context)),
          ],
        ),
      );
    }

    return Column(
      children: [
        // Audio player
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: GlassContainer(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(LucideIcons.headphones, size: 16, color: DesignSystem.primary(context)),
                    const SizedBox(width: 8),
                    Text('Listening Audio',
                        style: DesignSystem.headingStyle(buildContext: context, fontSize: 14)),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF87171).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text('Plays once',
                          style: GoogleFonts.inter(
                              color: const Color(0xFFF87171), fontSize: 10, fontWeight: FontWeight.w600)),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                if (listening.audioBase64 != null)
                  IELTSRestrictedAudioPlayer(base64Audio: listening.audioBase64)
                else
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF87171).withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        const Icon(LucideIcons.alertCircle, color: Color(0xFFF87171), size: 18),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'Audio not available. Please generate a new exam.',
                            style: GoogleFonts.inter(color: const Color(0xFFF87171), fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 4),
        // Questions
        Expanded(
          child: listening.questions.isEmpty
              ? Center(child: Text('No questions available.', style: DesignSystem.labelStyle(buildContext: context)))
              : ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                  itemCount: listening.questions.length,
                  itemBuilder: (context, i) {
                    final q = listening.questions[i];
                    final key = 'L_${q.id}';
                    final selected = state.answers[key] as String?;
                    return _ListeningQuestionCard(
                      index: i,
                      question: q,
                      selected: selected,
                      onSelect: (opt) => notifier.updateAnswer(key, opt),
                    );
                  },
                ),
        ),
      ],
    );
  }
}

class _ListeningQuestionCard extends StatelessWidget {
  final int index;
  final AssessmentQuestion question;
  final String? selected;
  final ValueChanged<String> onSelect;
  const _ListeningQuestionCard({required this.index, required this.question, required this.selected, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    final primary = DesignSystem.primary(context);
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      child: GlassContainer(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 24, height: 24,
                  decoration: BoxDecoration(
                    color: Colors.blue.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Center(
                    child: Text('${index + 1}',
                        style: GoogleFonts.inter(color: Colors.blue, fontWeight: FontWeight.bold, fontSize: 11)),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(question.question,
                      style: DesignSystem.bodyStyle(buildContext: context, fontSize: 13, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ...question.options.map((opt) {
              final isSel = selected == opt;
              return GestureDetector(
                onTap: () => onSelect(opt),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: isSel ? primary.withValues(alpha: 0.1) : DesignSystem.surface(context),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isSel ? primary : DesignSystem.glassBorder(context),
                      width: isSel ? 1.5 : 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 150),
                        width: 18, height: 18,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isSel ? primary : Colors.transparent,
                          border: Border.all(
                              color: isSel ? primary : DesignSystem.glassBorder(context), width: 1.5),
                        ),
                        child: isSel ? const Icon(Icons.check, size: 11, color: Colors.white) : null,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(opt,
                            style: DesignSystem.bodyStyle(
                                buildContext: context,
                                fontSize: 13,
                                fontWeight: isSel ? FontWeight.w600 : FontWeight.normal)),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
