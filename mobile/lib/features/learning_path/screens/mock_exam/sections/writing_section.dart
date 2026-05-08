import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/learning_path/providers/mock_exam_provider.dart';
import 'package:mobile/features/learning_path/models/assessment_model.dart';
import 'package:mobile/features/learning_path/screens/mock_exam/mock_exam_haptics.dart';

class WritingSectionWidget extends ConsumerStatefulWidget {
  const WritingSectionWidget({super.key});

  @override
  ConsumerState<WritingSectionWidget> createState() => _WritingSectionWidgetState();
}

class _WritingSectionWidgetState extends ConsumerState<WritingSectionWidget> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late TextEditingController _task1Controller;
  late TextEditingController _task2Controller;
  bool _showPassageOverlay = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _task1Controller = TextEditingController();
    _task2Controller = TextEditingController();

    final state = ref.read(mockExamProvider);
    _task1Controller.text = state.answers['writing_task1'] ?? '';
    _task2Controller.text = state.answers['writing_task2'] ?? '';
  }

  @override
  void dispose() {
    _tabController.dispose();
    _task1Controller.dispose();
    _task2Controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(mockExamProvider);
    final section = state.blueprint?.sections.writing;
    final accent = state.primaryAccent;
    final isToefl = state.examType == 'TOEFL';

    if (section == null) return const Center(child: CircularProgressIndicator());

    return Stack(
      children: [
        Column(
          children: [
            Container(
              margin: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(16),
              ),
              child: TabBar(
                controller: _tabController,
                indicator: BoxDecoration(color: accent, borderRadius: BorderRadius.circular(12)),
                labelColor: Colors.black,
                unselectedLabelColor: Colors.white54,
                dividerColor: Colors.transparent,
                indicatorSize: TabBarIndicatorSize.tab,
                tabs: [
                  Tab(text: isToefl ? "INTEGRATED" : "TASK 1"),
                  Tab(text: isToefl ? "ACADEMIC" : "TASK 2"),
                ],
              ),
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _IntegratedTaskEditor(
                    title: isToefl ? "Integrated Writing Task" : "Writing Task 1",
                    prompt: section.task1Prompt,
                    imageUrl: section.task1ImageUrl,
                    controller: _task1Controller,
                    targetWords: isToefl ? 150 : 150,
                    accent: accent,
                    onTogglePassage: () => setState(() => _showPassageOverlay = !_showPassageOverlay),
                    onChanged: (val) {
                      ref.read(mockExamProvider.notifier).updateAnswer('writing_task1', val);
                      _checkHaptic(val, 150);
                    },
                  ),
                  _AcademicDiscussionEditor(
                    title: isToefl ? "Academic Discussion" : "Writing Task 2",
                    prompt: section.task2Prompt,
                    professorPost: section.professorPost,
                    studentPosts: section.studentPosts,
                    controller: _task2Controller,
                    targetWords: isToefl ? 100 : 250,
                    accent: accent,
                    onChanged: (val) {
                      ref.read(mockExamProvider.notifier).updateAnswer('writing_task2', val);
                      _checkHaptic(val, isToefl ? 100 : 250);
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
        if (_showPassageOverlay && isToefl)
          _buildPassageOverlay(section.task1Prompt, accent),
      ],
    );
  }

  Widget _buildPassageOverlay(String passage, Color accent) {
    return Positioned.fill(
      child: GestureDetector(
        onTap: () => setState(() => _showPassageOverlay = false),
        child: Container(
          color: Colors.black54,
          padding: const EdgeInsets.all(40),
          child: GlassContainer(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("READING REFERENCE", style: GoogleFonts.plusJakartaSans(color: accent, fontWeight: FontWeight.bold, fontSize: 11)),
                    IconButton(onPressed: () => setState(() => _showPassageOverlay = false), icon: const Icon(Icons.close, color: Colors.white38)),
                  ],
                ),
                const SizedBox(height: 16),
                Expanded(child: SingleChildScrollView(child: Text(passage, style: GoogleFonts.lora(color: Colors.white, fontSize: 15, height: 1.6)))),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _checkHaptic(String text, int target) {
    final count = text.trim().isEmpty ? 0 : text.trim().split(RegExp(r'\s+')).length;
    if (count == target) MockExamHaptics.success();
  }
}

class _IntegratedTaskEditor extends StatelessWidget {
  final String title, prompt;
  final String? imageUrl;
  final TextEditingController controller;
  final int targetWords;
  final Color accent;
  final VoidCallback onTogglePassage;
  final ValueChanged<String> onChanged;

  const _IntegratedTaskEditor({
    required this.title, required this.prompt, this.imageUrl,
    required this.controller, required this.targetWords, required this.accent,
    required this.onTogglePassage, required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final wordCount = controller.text.trim().isEmpty ? 0 : controller.text.trim().split(RegExp(r'\s+')).length;
    final isTargetMet = wordCount >= targetWords;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title.toUpperCase(), style: GoogleFonts.plusJakartaSans(color: accent, fontWeight: FontWeight.w800, fontSize: 12, letterSpacing: 1)),
              TextButton.icon(
                onPressed: onTogglePassage,
                icon: Icon(LucideIcons.eye, size: 14, color: accent),
                label: Text("VIEW PASSAGE", style: GoogleFonts.plusJakartaSans(color: accent, fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildCounter(wordCount, targetWords, accent, isTargetMet),
          const SizedBox(height: 12),
          _buildEditor(controller, onChanged),
          const SizedBox(height: 100),
        ],
      ),
    );
  }
}

class _AcademicDiscussionEditor extends StatelessWidget {
  final String title, prompt;
  final String? professorPost;
  final List<Map<String, String>>? studentPosts;
  final TextEditingController controller;
  final int targetWords;
  final Color accent;
  final ValueChanged<String> onChanged;

  const _AcademicDiscussionEditor({
    required this.title, required this.prompt, this.professorPost, this.studentPosts,
    required this.controller, required this.targetWords, required this.accent,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final wordCount = controller.text.trim().isEmpty ? 0 : controller.text.trim().split(RegExp(r'\s+')).length;
    final isTargetMet = wordCount >= targetWords;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title.toUpperCase(), style: GoogleFonts.plusJakartaSans(color: accent, fontWeight: FontWeight.w800, fontSize: 12, letterSpacing: 1)),
          const SizedBox(height: 16),
          if (professorPost != null) ...[
            _buildChatBubble("Professor Dr. Smith", professorPost!, accent, true),
            const SizedBox(height: 12),
          ],
          if (studentPosts != null)
            ...studentPosts!.map((s) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _buildChatBubble(s['name']!, s['post']!, Colors.white38, false),
            )),
          const SizedBox(height: 24),
          _buildCounter(wordCount, targetWords, accent, isTargetMet),
          const SizedBox(height: 12),
          _buildEditor(controller, onChanged, hint: "Contribute to the discussion..."),
          const SizedBox(height: 100),
        ],
      ),
    );
  }

  Widget _buildChatBubble(String author, String text, Color color, bool isProfessor) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CircleAvatar(radius: 16, backgroundColor: color.withOpacity(0.2), child: Text(author[0], style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold))),
        const SizedBox(width: 12),
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), borderRadius: BorderRadius.circular(16)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(author, style: GoogleFonts.plusJakartaSans(color: color, fontWeight: FontWeight.bold, fontSize: 11)),
                const SizedBox(height: 4),
                Text(text, style: GoogleFonts.inter(color: Colors.white70, fontSize: 13, height: 1.4)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

Widget _buildCounter(int count, int target, Color accent, bool isMet) {
  final color = isMet ? const Color(0xFF10B981) : const Color(0xFFF59E0B);
  return Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(6), border: Border.all(color: color.withOpacity(0.3))),
    child: Text("$count / $target words", style: GoogleFonts.jetBrainsMono(color: color, fontWeight: FontWeight.bold, fontSize: 11)),
  );
}

Widget _buildEditor(TextEditingController controller, ValueChanged<String> onChanged, {String hint = "Start writing here..."}) {
  return Container(
    constraints: const BoxConstraints(minHeight: 300),
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(color: Colors.white.withOpacity(0.03), borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.white.withOpacity(0.1))),
    child: TextField(
      controller: controller, onChanged: onChanged, maxLines: null,
      style: GoogleFonts.jetBrainsMono(color: Colors.white, fontSize: 15, height: 1.6),
      decoration: InputDecoration(hintText: hint, hintStyle: const TextStyle(color: Colors.white24), border: InputBorder.none),
    ),
  );
}
