import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/learning_path/providers/toefl_task_provider.dart';

class ToeflIntegratedView extends ConsumerWidget {
  const ToeflIntegratedView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(toeflTaskProvider);

    return Column(
      children: [
        // Stage Switcher Ribbon
        _buildStageIndicator(state.currentStage),

        Expanded(
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 500),
            child: _buildStageContent(state, context, ref),
          ),
        ),
      ],
    );
  }

  Widget _buildStageIndicator(ToeflStage currentStage) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _indicatorItem("READ", currentStage == ToeflStage.reading),
          _indicatorConnector(),
          _indicatorItem("LISTEN", currentStage == ToeflStage.listening),
          _indicatorConnector(),
          _indicatorItem("RESPOND", currentStage == ToeflStage.response),
        ],
      ),
    );
  }

  Widget _indicatorItem(String label, bool active) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: active ? const Color(0xFF3B82F6) : Colors.white10,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: active ? Colors.white : Colors.white38,
              fontSize: 10,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }

  Widget _indicatorConnector() {
    return Container(
      width: 20,
      height: 1,
      margin: const EdgeInsets.symmetric(horizontal: 4),
      color: Colors.white10,
    );
  }

  Widget _buildStageContent(ToeflTaskState state, BuildContext context, WidgetRef ref) {
    switch (state.currentStage) {
      case ToeflStage.reading:
        return _buildReadingCard(state);
      case ToeflStage.listening:
        return _buildAudioCard(state, context);
      case ToeflStage.response:
        return _buildResponseArea(state, ref);
    }
  }

  Widget _buildReadingCard(ToeflTaskState state) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: GlassContainer(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Academic Reading Passage",
              style: TextStyle(color: Color(0xFF3B82F6), fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Text(
              state.currentReadingPassage ?? "Loading academic content...",
              style: const TextStyle(color: Colors.white, fontSize: 15, height: 1.6),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAudioCard(ToeflTaskState state, BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: GlassContainer(
          padding: const EdgeInsets.all(30),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(LucideIcons.headphones, size: 60, color: Color(0xFF3B82F6)),
              const SizedBox(height: 20),
              Text(
                "Listening to Lecture...",
                style: GoogleFonts.plusJakartaSans(color: Colors.white, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 30),
              TextField(
                maxLines: 5,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: "Take notes here (Not graded)...",
                  hintStyle: const TextStyle(color: Colors.white24),
                  filled: true,
                  fillColor: Colors.black26,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide.none),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildResponseArea(ToeflTaskState state, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: GlassContainer(
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("Your Response", style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold)),
                TextButton.icon(
                  onPressed: () => _showPassageOverlay(state, ref),
                  icon: const Icon(LucideIcons.eye, size: 14, color: Color(0xFF3B82F6)),
                  label: const Text("Show Passage", style: TextStyle(color: Color(0xFF3B82F6), fontSize: 12)),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Expanded(
              child: TextField(
                maxLines: null,
                expands: true,
                style: const TextStyle(color: Colors.white, fontSize: 15),
                decoration: InputDecoration(
                  hintText: "Explain the professor's opinion...",
                  hintStyle: const TextStyle(color: Colors.white10),
                  border: InputBorder.none,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showPassageOverlay(ToeflTaskState state, WidgetRef ref) {
    // Implement overlay dialog or bottom sheet for passage reference
  }
}
