import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/learning_path/providers/mock_exam_provider.dart';
import 'package:mobile/features/learning_path/widgets/restricted_audio_player.dart';
 
class ListeningSection extends ConsumerWidget {
  const ListeningSection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(mockExamProvider);
    final listeningData = state.blueprint?.sections.listening;

    return Column(
      children: [
        // Audio Player - Plays only ONCE
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: GlassContainer(
            child: Column(
              children: [
                const Text(
                  "Section 1: Listening",
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                const Text(
                  "The audio will play only once. Answer questions as you listen.",
                  style: TextStyle(color: Colors.white70, fontSize: 12),
                ),
                const SizedBox(height: 16),
                IELTSRestrictedAudioPlayer(
                  base64Audio: listeningData?.audioBase64,
                ),
              ],
            ),
          ),
        ),

        // Questions List
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: listeningData?.questions.length ?? 5, // Mock count if no data
            itemBuilder: (context, index) {
              final qId = "L${index + 1}";
              final isReviewed = state.reviewedQuestions.contains(qId);
              
              return Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
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
                        "Sample Listening Question: Write NO MORE THAN TWO WORDS for each answer.",
                        style: TextStyle(color: Colors.white, fontSize: 14),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        onChanged: (val) => ref.read(mockExamProvider.notifier).updateAnswer(qId, val),
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          hintText: "Type your answer...",
                          hintStyle: const TextStyle(color: Colors.white24),
                          filled: true,
                          // ignore: deprecated_member_use
                          fillColor: Colors.white.withOpacity(0.05),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
