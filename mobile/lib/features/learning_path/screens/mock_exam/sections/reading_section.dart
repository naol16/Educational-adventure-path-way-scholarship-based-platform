import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/learning_path/models/assessment_model.dart';
import 'package:mobile/features/learning_path/providers/mock_exam_provider.dart';

class ReadingSectionWidget extends ConsumerWidget {
  const ReadingSectionWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(mockExamProvider);
    final notifier = ref.read(mockExamProvider.notifier);
    final reading = state.blueprint?.sections.reading;

    if (reading == null) {
      return _EmptySection(label: 'Reading', icon: LucideIcons.bookOpen);
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth > 700;
        if (isWide) {
          return Row(
            children: [
              Expanded(flex: 6, child: _PassagePane(passage: reading.passage)),
              VerticalDivider(width: 1, color: DesignSystem.glassBorder(context)),
              Expanded(flex: 4, child: _QuestionsPane(questions: reading.questions, prefix: 'R', notifier: notifier, answers: state.answers)),
            ],
          );
        }
        return DefaultTabController(
          length: 2,
          child: Column(
            children: [
              TabBar(
                indicatorColor: DesignSystem.primary(context),
                labelColor: DesignSystem.primary(context),
                unselectedLabelColor: DesignSystem.labelText(context),
                labelStyle: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13),
                tabs: const [Tab(text: 'Passage'), Tab(text: 'Questions')],
              ),
              Expanded(
                child: TabBarView(
                  children: [
                    _PassagePane(passage: reading.passage),
                    _QuestionsPane(questions: reading.questions, prefix: 'R', notifier: notifier, answers: state.answers),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _PassagePane extends StatelessWidget {
  final String passage;
  const _PassagePane({required this.passage});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: GlassContainer(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(LucideIcons.bookOpen, size: 16, color: DesignSystem.primary(context)),
                const SizedBox(width: 8),
                Text('Reading Passage',
                    style: DesignSystem.headingStyle(buildContext: context, fontSize: 15)),
              ],
            ),
            const SizedBox(height: 16),
            SelectableText(
              passage,
              style: GoogleFonts.lora(
                color: DesignSystem.mainText(context),
                fontSize: 14,
                height: 1.75,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuestionsPane extends StatelessWidget {
  final List<AssessmentQuestion> questions;
  final String prefix;
  final MockExamNotifier notifier;
  final Map<String, dynamic> answers;
  const _QuestionsPane({required this.questions, required this.prefix, required this.notifier, required this.answers});

  @override
  Widget build(BuildContext context) {
    if (questions.isEmpty) {
      return Center(child: Text('No questions available.', style: DesignSystem.labelStyle(buildContext: context)));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: questions.length,
      itemBuilder: (context, i) {
        final q = questions[i];
        final key = '${prefix}_${q.id}';
        final selected = answers[key] as String?;
        return _QuestionCard(
          index: i,
          question: q.question,
          options: q.options,
          selected: selected,
          onSelect: (opt) => notifier.updateAnswer(key, opt),
        );
      },
    );
  }
}

class _QuestionCard extends StatelessWidget {
  final int index;
  final String question;
  final List<String> options;
  final String? selected;
  final ValueChanged<String> onSelect;
  const _QuestionCard({required this.index, required this.question, required this.options, required this.selected, required this.onSelect});

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
                    color: primary.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Center(
                    child: Text('${index + 1}',
                        style: GoogleFonts.inter(color: primary, fontWeight: FontWeight.bold, fontSize: 11)),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(question,
                      style: DesignSystem.bodyStyle(buildContext: context, fontSize: 13, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ...options.map((opt) {
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
                          border: Border.all(color: isSel ? primary : DesignSystem.glassBorder(context), width: 1.5),
                        ),
                        child: isSel
                            ? const Icon(Icons.check, size: 11, color: Colors.white)
                            : null,
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

class _EmptySection extends StatelessWidget {
  final String label;
  final IconData icon;
  const _EmptySection({required this.label, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 48, color: DesignSystem.labelText(context).withValues(alpha: 0.3)),
          const SizedBox(height: 12),
          Text('$label section not available.',
              style: DesignSystem.labelStyle(buildContext: context, fontSize: 14)),
        ],
      ),
    );
  }
}
