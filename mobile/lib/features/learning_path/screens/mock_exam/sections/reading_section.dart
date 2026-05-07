import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/learning_path/providers/mock_exam_provider.dart';
import 'package:mobile/features/learning_path/models/assessment_model.dart';

class ReadingSectionWidget extends ConsumerStatefulWidget {
  const ReadingSectionWidget({super.key});

  @override
  ConsumerState<ReadingSectionWidget> createState() => _ReadingSectionWidgetState();
}

class _ReadingSectionWidgetState extends ConsumerState<ReadingSectionWidget> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _showPassageOverlay(BuildContext context, String passage) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.8,
        decoration: const BoxDecoration(
          color: Color(0xFF0F172A),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          children: [
            Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2)),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Text(
                  passage,
                  style: GoogleFonts.lora(color: Colors.white, fontSize: 16, height: 1.6),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(mockExamProvider);
    final section = state.blueprint?.sections.reading;
    final accent = state.primaryAccent;

    if (section == null) return const Center(child: CircularProgressIndicator());

    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: _tabController.index == 1 
          ? FloatingActionButton.extended(
              onPressed: () => _showPassageOverlay(context, section.passage),
              backgroundColor: accent,
              icon: const Icon(Icons.article_outlined, color: Colors.black),
              label: Text("VIEW PASSAGE", style: GoogleFonts.plusJakartaSans(color: Colors.black, fontWeight: FontWeight.bold)),
            )
          : null,
      body: Column(
        children: [
          Container(
            margin: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(16),
            ),
            child: TabBar(
              controller: _tabController,
              onTap: (index) => setState(() {}),
              indicator: BoxDecoration(
                color: accent,
                borderRadius: BorderRadius.circular(12),
              ),
              labelColor: Colors.black,
              unselectedLabelColor: Colors.white54,
              dividerColor: Colors.transparent,
              indicatorSize: TabBarIndicatorSize.tab,
              tabs: const [
                Tab(text: "PASSAGE"),
                Tab(text: "QUESTIONS"),
              ],
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _PassageView(section: section, state: state),
                _QuestionsView(section: section, state: state),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PassageView extends ConsumerWidget {
  final ReadingSection section;
  final MockExamState state;

  const _PassageView({required this.section, required this.state});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ...List.generate(section.paragraphs.length, (index) {
            final label = String.fromCharCode(65 + index);
            final text = section.paragraphs[index];
            
            return Padding(
              padding: const EdgeInsets.only(bottom: 24),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      border: Border.all(color: state.primaryAccent.withOpacity(0.3)),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Center(
                      child: Text(
                        label,
                        style: GoogleFonts.plusJakartaSans(color: state.primaryAccent, fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _SelectableTextWithHighlights(
                      text: text,
                      highlights: state.highlights,
                      accent: state.primaryAccent,
                      onSelection: (start, end) {
                        ref.read(mockExamProvider.notifier).addHighlight(start, end);
                      },
                    ),
                  ),
                ],
              ),
            );
          }),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}

class _SelectableTextWithHighlights extends StatelessWidget {
  final String text;
  final List<Map<String, int>> highlights;
  final Color accent;
  final Function(int, int) onSelection;

  const _SelectableTextWithHighlights({
    required this.text,
    required this.highlights,
    required this.accent,
    required this.onSelection,
  });

  @override
  Widget build(BuildContext context) {
    List<TextSpan> spans = [];
    int current = 0;
    final sortedHighlights = List<Map<String, int>>.from(highlights)
      ..sort((a, b) => a['start']!.compareTo(b['start']!));

    for (final h in sortedHighlights) {
      if (h['start']! > current) {
        spans.add(TextSpan(text: text.substring(current, h['start']!)));
      }
      spans.add(TextSpan(
        text: text.substring(h['start']!, h['end']!),
        style: TextStyle(backgroundColor: accent.withOpacity(0.3)),
      ));
      current = h['end']!;
    }
    if (current < text.length) spans.add(TextSpan(text: text.substring(current)));

    return SelectableText.rich(
      TextSpan(
        children: spans,
        style: GoogleFonts.lora(color: Colors.white.withOpacity(0.9), fontSize: 16, height: 1.6),
      ),
      contextMenuBuilder: (context, editableTextState) {
        return AdaptiveTextSelectionToolbar.buttonItems(
          anchors: editableTextState.contextMenuAnchors,
          buttonItems: [
            ContextMenuButtonItem(
              label: 'Highlight',
              onPressed: () {
                final selection = editableTextState.textEditingValue.selection;
                onSelection(selection.start, selection.end);
                editableTextState.hideToolbar();
              },
            ),
            ...editableTextState.contextMenuButtonItems,
          ],
        );
      },
    );
  }
}

class _QuestionsView extends ConsumerWidget {
  final ReadingSection section;
  final MockExamState state;

  const _QuestionsView({required this.section, required this.state});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final questions = section.questions;
    final currentQ = questions.isNotEmpty && state.currentQuestionIndex < questions.length
        ? questions[state.currentQuestionIndex]
        : null;

    if (currentQ == null) return const SizedBox.shrink();

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "QUESTION ${state.currentQuestionIndex + 1}",
            style: GoogleFonts.plusJakartaSans(color: state.primaryAccent, fontWeight: FontWeight.w800, fontSize: 12, letterSpacing: 1),
          ),
          const SizedBox(height: 12),
          _buildQuestionRenderer(context, ref, currentQ, state),
          const SizedBox(height: 100),
        ],
      ),
    );
  }

  Widget _buildQuestionRenderer(BuildContext context, WidgetRef ref, AssessmentQuestion q, MockExamState state) {
    return switch (q.type) {
      QuestionType.insert => _InsertRenderer(q: q, state: state, ref: ref),
      QuestionType.summary => _SummaryRenderer(q: q, state: state, ref: ref),
      QuestionType.tfng => _TFNGRenderer(q: q, state: state, ref: ref),
      QuestionType.heading => _HeadingRenderer(q: q, state: state, ref: ref, headings: state.blueprint!.sections.reading!.headings),
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
    final selected = state.answers['R_${q.id}'];
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
              onTap: () => ref.read(mockExamProvider.notifier).updateAnswer('R_${q.id}', opt),
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

class _TFNGRenderer extends StatelessWidget {
  final AssessmentQuestion q;
  final MockExamState state;
  final WidgetRef ref;

  const _TFNGRenderer({required this.q, required this.state, required this.ref});

  @override
  Widget build(BuildContext context) {
    final selected = state.answers['R_${q.id}'];
    final options = ['TRUE', 'FALSE', 'NOT GIVEN'];
    final accent = state.primaryAccent;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(q.question, style: DesignSystem.headingStyle(buildContext: context, fontSize: 18)),
        const SizedBox(height: 24),
        Column(
          children: options.map((opt) {
            final isSelected = selected == opt;
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: InkWell(
                onTap: () => ref.read(mockExamProvider.notifier).updateAnswer('R_${q.id}', opt),
                borderRadius: BorderRadius.circular(12),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    color: isSelected ? accent : Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: isSelected ? accent : Colors.white.withOpacity(0.1)),
                  ),
                  child: Center(
                    child: Text(
                      opt,
                      style: GoogleFonts.plusJakartaSans(
                        color: isSelected ? Colors.black : Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

class _HeadingRenderer extends StatelessWidget {
  final AssessmentQuestion q;
  final MockExamState state;
  final WidgetRef ref;
  final List<String> headings;

  const _HeadingRenderer({required this.q, required this.state, required this.ref, required this.headings});

  @override
  Widget build(BuildContext context) {
    final selected = state.answers['R_${q.id}'];
    final accent = state.primaryAccent;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(q.question, style: DesignSystem.headingStyle(buildContext: context, fontSize: 18)),
        const SizedBox(height: 24),
        ...headings.map((h) {
          final isSelected = selected == h;
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: InkWell(
              onTap: () => ref.read(mockExamProvider.notifier).updateAnswer('R_${q.id}', h),
              borderRadius: BorderRadius.circular(12),
              child: GlassContainer(
                padding: const EdgeInsets.all(12),
                borderColor: isSelected ? accent : null,
                child: Row(
                  children: [
                    Text(
                      String.fromCharCode(105 + headings.indexOf(h)),
                      style: GoogleFonts.jetBrainsMono(color: accent, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(h, style: GoogleFonts.inter(color: Colors.white, fontSize: 14)),
                    ),
                    if (isSelected) Icon(Icons.check_circle, color: accent, size: 20),
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

class _InsertRenderer extends StatelessWidget {
  final AssessmentQuestion q;
  final MockExamState state;
  final WidgetRef ref;

  const _InsertRenderer({required this.q, required this.state, required this.ref});

  @override
  Widget build(BuildContext context) {
    final selectedIdx = state.answers['R_${q.id}'] as int?;
    final accent = state.primaryAccent;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("SENTENCE INSERTION", style: GoogleFonts.plusJakartaSans(color: accent, fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 1.5)),
        const SizedBox(height: 12),
        GlassContainer(
          padding: const EdgeInsets.all(16),
          child: Text(
            q.insertSentence ?? "",
            style: GoogleFonts.lora(color: Colors.white, fontSize: 16, height: 1.5, fontStyle: FontStyle.italic),
          ),
        ),
        const SizedBox(height: 24),
        Text("Tap the square [■] in the paragraph where this sentence belongs:", style: DesignSystem.labelStyle(buildContext: context)),
        const SizedBox(height: 16),
        ...List.generate(q.options.length, (index) {
          final isSelected = selectedIdx == index;
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: InkWell(
              onTap: () => ref.read(mockExamProvider.notifier).updateAnswer('R_${q.id}', index),
              child: GlassContainer(
                padding: const EdgeInsets.all(12),
                borderColor: isSelected ? accent : null,
                child: Row(
                  children: [
                    Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: isSelected ? accent : Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Center(child: Text("${index + 1}", style: TextStyle(color: isSelected ? Colors.black : Colors.white54, fontSize: 10, fontWeight: FontWeight.bold))),
                    ),
                    const SizedBox(width: 12),
                    Expanded(child: Text(q.options[index], style: GoogleFonts.inter(color: Colors.white70, fontSize: 13))),
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

class _SummaryRenderer extends StatelessWidget {
  final AssessmentQuestion q;
  final MockExamState state;
  final WidgetRef ref;

  const _SummaryRenderer({required this.q, required this.state, required this.ref});

  @override
  Widget build(BuildContext context) {
    final selected = (state.answers['R_${q.id}'] as List?)?.cast<String>() ?? [];
    final accent = state.primaryAccent;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(q.question, style: DesignSystem.headingStyle(buildContext: context, fontSize: 18)),
        const SizedBox(height: 8),
        Text("Select exactly 3 options:", style: DesignSystem.labelStyle(buildContext: context)),
        const SizedBox(height: 24),
        ...q.options.map((opt) {
          final isSelected = selected.contains(opt);
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: InkWell(
              onTap: () {
                final newList = List<String>.from(selected);
                if (isSelected) {
                  newList.remove(opt);
                } else if (newList.length < 3) {
                  newList.add(opt);
                }
                ref.read(mockExamProvider.notifier).updateAnswer('R_${q.id}', newList);
              },
              borderRadius: BorderRadius.circular(12),
              child: GlassContainer(
                padding: const EdgeInsets.all(16),
                borderColor: isSelected ? accent : null,
                child: Row(
                  children: [
                    Icon(isSelected ? Icons.check_box : Icons.check_box_outline_blank, color: isSelected ? accent : Colors.white24),
                    const SizedBox(width: 16),
                    Expanded(child: Text(opt, style: GoogleFonts.inter(color: Colors.white, fontSize: 14))),
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
