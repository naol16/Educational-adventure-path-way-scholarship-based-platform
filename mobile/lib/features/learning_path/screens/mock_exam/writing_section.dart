import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/learning_path/providers/mock_exam_provider.dart';

class WritingSection extends ConsumerStatefulWidget {
  const WritingSection({super.key});

  @override
  ConsumerState<WritingSection> createState() => _WritingSectionState();
}

class _WritingSectionState extends ConsumerState<WritingSection> {
  final TextEditingController _task1Controller = TextEditingController();
  final TextEditingController _task2Controller = TextEditingController();
  int _task1WordCount = 0;
  int _task2WordCount = 0;

  @override
  void initState() {
    super.initState();
    _task1Controller.addListener(() {
      setState(() {
        _task1WordCount = _countWords(_task1Controller.text);
      });
      ref.read(mockExamProvider.notifier).updateAnswer('W1', _task1Controller.text);
    });
    _task2Controller.addListener(() {
      setState(() {
        _task2WordCount = _countWords(_task2Controller.text);
      });
      ref.read(mockExamProvider.notifier).updateAnswer('W2', _task2Controller.text);
    });
  }

  int _countWords(String text) {
    if (text.trim().isEmpty) return 0;
    return text.trim().split(RegExp(r'\s+')).length;
  }

  @override
  void dispose() {
    _task1Controller.dispose();
    _task2Controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Column(
        children: [
          const TabBar(
            indicatorColor: Color(0xFF10B981),
            labelColor: Color(0xFF10B981),
            unselectedLabelColor: Colors.white38,
            tabs: [
              Tab(text: "Task 1 (Report)"),
              Tab(text: "Task 2 (Essay)"),
            ],
          ),
          Expanded(
            child: TabBarView(
              children: [
                _buildWritingTask(
                  "Task 1",
                  "The chart below shows the changes in global energy consumption from 1990 to 2010. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
                  _task1Controller,
                  _task1WordCount,
                  150,
                ),
                _buildWritingTask(
                  "Task 2",
                  "Some people believe that the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better alternative ways of reducing crime. Discuss both views and give your own opinion.",
                  _task2Controller,
                  _task2WordCount,
                  250,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWritingTask(String title, String prompt, TextEditingController controller, int count, int min) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth > 800;
        
        final promptWidget = GlassContainer(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 18)),
              const SizedBox(height: 12),
              Text(prompt, style: const TextStyle(color: Colors.white, fontSize: 14, height: 1.5)),
              const SizedBox(height: 20),
              Text("Note: Write at least $min words.", style: const TextStyle(color: Colors.white38, fontSize: 12, fontStyle: FontStyle.italic)),
            ],
          ),
        );

        final editorWidget = GlassContainer(
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text("Your Response", style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold)),
                  Text(
                    "Word Count: $count",
                    style: TextStyle(
                      color: count < min ? Colors.orangeAccent : const Color(0xFF10B981),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Expanded(
                child: TextField(
                  controller: controller,
                  maxLines: null,
                  expands: true,
                  style: const TextStyle(color: Colors.white, fontSize: 15, height: 1.6),
                  decoration: InputDecoration(
                    hintText: "Start writing here...",
                    hintStyle: const TextStyle(color: Colors.white10),
                    border: InputBorder.none,
                    filled: true,
                    // ignore: deprecated_member_use
                    fillColor: Colors.white.withOpacity(0.02),
                  ),
                ),
              ),
            ],
          ),
        );

        if (isWide) {
          return Row(
            children: [
              Expanded(flex: 1, child: Padding(padding: const EdgeInsets.all(16.0), child: promptWidget)),
              Expanded(flex: 1, child: Padding(padding: const EdgeInsets.all(16.0), child: editorWidget)),
            ],
          );
        } else {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                promptWidget,
                const SizedBox(height: 16),
                SizedBox(height: 400, child: editorWidget),
              ],
            ),
          );
        }
      },
    );
  }
}
