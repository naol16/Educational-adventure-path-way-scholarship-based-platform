import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/learning_path/providers/mock_exam_provider.dart';

class ReadingSection extends ConsumerWidget {
  const ReadingSection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(mockExamProvider);
    
    return LayoutBuilder(
      builder: (context, constraints) {
        // Handle split screen for mobile (vertical) vs tablet/web (horizontal)
        final isWide = constraints.maxWidth > 800;
        
        if (isWide) {
          return Row(
            children: [
              Expanded(flex: 1, child: _buildPassageView()),
              const VerticalDivider(color: Colors.white10, width: 1),
              Expanded(flex: 1, child: _buildQuestionView(state, ref)),
            ],
          );
        } else {
          return Column(
            children: [
              Expanded(flex: 2, child: _buildPassageView()),
              const Divider(color: Colors.white10, height: 1),
              Expanded(flex: 3, child: _buildQuestionView(state, ref)),
            ],
          );
        }
      },
    );
  }

  Widget _buildPassageView() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: SingleChildScrollView(
        child: GlassContainer(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Reading Passage 1",
                style: TextStyle(color: Color(0xFF10B981), fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              Text(
                "The Impact of Artificial Intelligence on Modern Education\n\n"
                "Artificial Intelligence (AI) is transforming the landscape of education in ways previously unimaginable. "
                "From personalized learning algorithms that adapt to a student's pace to automated grading systems that free up "
                "valuable time for teachers, the integration of technology is reshaping how knowledge is delivered and absorbed. "
                "However, this rapid evolution also brings challenges, including concerns about data privacy and the potential "
                "loss of human touch in the learning process...\n\n"
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore "
                "magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo "
                "consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
                style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 15, height: 1.6),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuestionView(MockExamState state, WidgetRef ref) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 10,
      itemBuilder: (context, index) {
        final qId = "R${index + 1}";
        final isReviewed = state.reviewedQuestions.contains(qId);

        return Padding(
          padding: const EdgeInsets.only(bottom: 16.0),
          child: GlassContainer(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("Question ${index + 1}", 
                      style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold)),
                    IconButton(
                      icon: Icon(
                        isReviewed ? Icons.flag : Icons.flag_outlined,
                        color: isReviewed ? Colors.orange : Colors.white24,
                      ),
                      onPressed: () => ref.read(mockExamProvider.notifier).toggleReview(qId),
                    ),
                  ],
                ),
                const Text(
                  "Do the following statements agree with the information given in Reading Passage 1?",
                  style: TextStyle(color: Colors.white70, fontSize: 12),
                ),
                const SizedBox(height: 8),
                Text(
                  "Statement: AI has completely replaced teachers in modern classrooms.",
                  style: TextStyle(color: Colors.white, fontSize: 14),
                ),
                const SizedBox(height: 12),
                _buildTFNGOptions(qId, state, ref),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildTFNGOptions(String qId, MockExamState state, WidgetRef ref) {
    final options = ["TRUE", "FALSE", "NOT GIVEN"];
    final currentAnswer = state.answers[qId];

    return Wrap(
      spacing: 8,
      children: options.map((opt) {
        final isSelected = currentAnswer == opt;
        return ChoiceChip(
          label: Text(opt, style: TextStyle(color: isSelected ? Colors.white : Colors.white70, fontSize: 12)),
          selected: isSelected,
          selectedColor: const Color(0xFF10B981).withOpacity(0.4),
          backgroundColor: Colors.white10,
          onSelected: (selected) {
            if (selected) ref.read(mockExamProvider.notifier).updateAnswer(qId, opt);
          },
        );
      }).toList(),
    );
  }
}
