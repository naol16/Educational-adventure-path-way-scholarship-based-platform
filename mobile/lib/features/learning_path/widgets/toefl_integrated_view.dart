import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/learning_path/providers/toefl_task_provider.dart';
import 'package:mobile/features/learning_path/widgets/audio_player_widget.dart';
import 'package:mobile/features/core/theme/design_system.dart';
 
class ToeflIntegratedView extends ConsumerWidget {
  const ToeflIntegratedView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(toeflTaskProvider);

    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 500),
      child: _buildStageContent(state, context, ref),
    );
  }

  Widget _buildStageContent(ToeflTaskState state, BuildContext context, WidgetRef ref) {
    switch (state.currentStage) {
      case ToeflStage.reading:
        return _buildReadingContent(context, state, ref);
      case ToeflStage.listening:
        return _buildListeningContent(context, state, ref);
      case ToeflStage.writing:
        return _buildWritingContent(context, state, ref);
      case ToeflStage.speaking:
        return _buildSpeakingContent(context, state, ref);
    }
  }

  Widget _buildReadingContent(BuildContext context, ToeflTaskState state, WidgetRef ref) {
    return SingleChildScrollView(
      key: const ValueKey('reading'),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "READING",
            style: DesignSystem.labelStyle(buildContext: context, fontSize: 12).copyWith(
              color: const Color(0xFF3B82F6),
              fontWeight: FontWeight.bold,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          GlassContainer(
            padding: const EdgeInsets.all(20),
            child: Text(
              state.currentReadingPassage ?? "Generating academic passage...",
              style: GoogleFonts.inter(
                color: Colors.white.withValues(alpha: 0.8),
                height: 1.6,
              ),
            ),
          ),
          const SizedBox(height: 24),
          ...state.readingQuestions.asMap().entries.map((entry) {
            final idx = entry.key;
            final q = entry.value;
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "${idx + 1}. ${q.question}",
                  style: DesignSystem.headingStyle(buildContext: context, fontSize: 16),
                ),
                const SizedBox(height: 16),
                ...q.options.map((opt) => _buildOption(
                      context,
                      opt,
                      skill: 'reading',
                      questionId: q.id.toString(),
                      state: state,
                      ref: ref,
                    )),
                const SizedBox(height: 24),
              ],
            );
          }),
        ],
      ),
    );
  }

  Widget _buildListeningContent(BuildContext context, ToeflTaskState state, WidgetRef ref) {
    return SingleChildScrollView(
      key: const ValueKey('listening'),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "LISTENING",
            style: DesignSystem.labelStyle(buildContext: context, fontSize: 12).copyWith(
              color: const Color(0xFF3B82F6),
              fontWeight: FontWeight.bold,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          CustomAudioPlayer(base64Audio: state.currentAudioBase64),
          const SizedBox(height: 24),
          Text(
            "NOTES",
            style: DesignSystem.labelStyle(buildContext: context, fontSize: 10).copyWith(color: Colors.white38),
          ),
          const SizedBox(height: 8),
          TextField(
            maxLines: 4,
            style: DesignSystem.bodyStyle(buildContext: context, fontSize: 14),
            decoration: InputDecoration(
              hintText: "Take notes while listening...",
              hintStyle: const TextStyle(color: Colors.white10),
              filled: true,
              fillColor: const Color(0xFF1E293B),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            ),
          ),
          const SizedBox(height: 32),
          ...state.listeningQuestions.asMap().entries.map((entry) {
            final idx = entry.key;
            final q = entry.value;
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "${idx + 1}. ${q.question}",
                  style: DesignSystem.headingStyle(buildContext: context, fontSize: 16),
                ),
                const SizedBox(height: 16),
                ...q.options.map((opt) => _buildOption(
                      context,
                      opt,
                      skill: 'listening',
                      questionId: q.id.toString(),
                      state: state,
                      ref: ref,
                    )),
                const SizedBox(height: 24),
              ],
            );
          }),
        ],
      ),
    );
  }

  Widget _buildWritingContent(BuildContext context, ToeflTaskState state, WidgetRef ref) {
    return SingleChildScrollView(
      key: const ValueKey('writing'),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "WRITING",
            style: DesignSystem.labelStyle(buildContext: context, fontSize: 12).copyWith(
              color: const Color(0xFF3B82F6),
              fontWeight: FontWeight.bold,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            "Summarize the points made in the lecture and explain how they cast doubt on specific points made in the reading passage.",
            style: DesignSystem.headingStyle(buildContext: context, fontSize: 18),
          ),
          const SizedBox(height: 12),
          TextButton.icon(
            onPressed: () => _showPassageOverlay(state, context),
            icon: const Icon(LucideIcons.eye, size: 14, color: Color(0xFF3B82F6)),
            label: const Text("VIEW READING PASSAGE", style: TextStyle(color: Color(0xFF3B82F6), fontSize: 12, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 12),
          TextField(
            maxLines: 15,
            style: DesignSystem.bodyStyle(buildContext: context),
            decoration: InputDecoration(
              hintText: "Type your response here...",
              hintStyle: DesignSystem.bodyStyle(buildContext: context, color: Colors.white24),
              filled: true,
              fillColor: const Color(0xFF1E293B),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide.none,
              ),
            ),
            onChanged: (val) {
               ref.read(toeflTaskProvider.notifier).updateResponse(val);
            },
          ),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerRight,
            child: Consumer(
              builder: (context, ref, _) {
                final writingResponse = ref.watch(toeflTaskProvider).responses['writing']?.toString() ?? "";
                final wordCount = writingResponse.trim().isEmpty ? 0 : writingResponse.trim().split(RegExp(r'\s+')).length;
                return Text(
                  "$wordCount Words",
                  style: DesignSystem.labelStyle(buildContext: context, fontSize: 12).copyWith(
                    color: wordCount < 150 ? Colors.orange : Colors.green,
                  ),
                );
              }
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSpeakingContent(BuildContext context, ToeflTaskState state, WidgetRef ref) {
    return _SpeakingSection(state: state);
  }
}

class _SpeakingSection extends StatefulWidget {
  final ToeflTaskState state;
  const _SpeakingSection({required this.state});

  @override
  State<_SpeakingSection> createState() => _SpeakingSectionState();
}

class _SpeakingSectionState extends State<_SpeakingSection> {
  int _prepSeconds = 15;
  Timer? _prepTimer;
  bool _prepDone = false;

  @override
  void initState() {
    super.initState();
    _startPrepTimer();
  }

  @override
  void dispose() {
    _prepTimer?.cancel();
    super.dispose();
  }

  void _startPrepTimer() {
    _prepTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_prepSeconds > 0) {
        setState(() => _prepSeconds--);
      } else {
        setState(() => _prepDone = true);
        _prepTimer?.cancel();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer(
      builder: (context, ref, _) {
        final state = widget.state;
        return SingleChildScrollView(
          key: const ValueKey('speaking'),
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "SPEAKING",
                style: DesignSystem.labelStyle(buildContext: context, fontSize: 12).copyWith(
                  color: const Color(0xFF3B82F6),
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                "State your opinion on the topic discussed in the reading and lecture.",
                style: DesignSystem.headingStyle(buildContext: context, fontSize: 18),
              ),
              const SizedBox(height: 24),
              if (!_prepDone)
                Center(
                  child: Column(
                    children: [
                      const Text("PREPARATION TIME", style: TextStyle(color: Colors.white38, fontSize: 10, letterSpacing: 1)),
                      const SizedBox(height: 8),
                      Text(
                        "00:${_prepSeconds.toString().padLeft(2, '0')}",
                        style: GoogleFonts.jetBrainsMono(color: const Color(0xFF3B82F6), fontSize: 32, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 10),
                      TextButton(
                        onPressed: () => setState(() => _prepDone = true),
                        child: const Text("SKIP PREP", style: TextStyle(color: Colors.white30, fontSize: 10)),
                      ),
                    ],
                  ),
                )
              else
                Center(
                  child: Column(
                    children: [
                      if (state.isRecording)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 20),
                          child: Text(
                            "RECORDING...",
                            style: GoogleFonts.inter(
                              color: Colors.red,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 2,
                            ),
                          ),
                        ),
                      GestureDetector(
                        onTap: () {
                          if (state.isRecording) {
                            ref.read(toeflTaskProvider.notifier).stopRecording();
                          } else {
                            ref.read(toeflTaskProvider.notifier).startRecording();
                          }
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: state.isRecording ? Colors.red.withValues(alpha: 0.1) : const Color(0xFF3B82F6).withValues(alpha: 0.1),
                            border: Border.all(
                              color: state.isRecording ? Colors.red : const Color(0xFF3B82F6),
                              width: 2,
                            ),
                            boxShadow: state.isRecording ? [
                              BoxShadow(color: Colors.red.withValues(alpha: 0.2), blurRadius: 20, spreadRadius: 5)
                            ] : null,
                          ),
                          child: Icon(
                            state.isRecording ? LucideIcons.stopCircle : LucideIcons.mic,
                            size: 40,
                            color: state.isRecording ? Colors.red : const Color(0xFF3B82F6),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        state.isRecording ? "Tap to Stop" : "Tap to Start Response",
                        style: DesignSystem.labelStyle(buildContext: context),
                      ),
                    ],
                  ),
                ),
              if (state.recordedAudioPath != null && !state.isRecording)
                Padding(
                  padding: const EdgeInsets.only(top: 24),
                  child: Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.green.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.green.withValues(alpha: 0.3)),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(LucideIcons.checkCircle, color: Colors.green, size: 14),
                          SizedBox(width: 8),
                          Text("Response Captured", style: TextStyle(color: Colors.green, fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
        );
      }
    );
  }
}

  Widget _buildOption(BuildContext context, String text, {required String skill, required String questionId, required ToeflTaskState state, required WidgetRef ref}) {
    final isSelected = state.responses[skill]?[questionId] == text;
    const primaryColor = Color(0xFF3B82F6);
    
    return GestureDetector(
      onTap: () => ref.read(toeflTaskProvider.notifier).updateQuestionResponse(skill, questionId, text),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? primaryColor.withValues(alpha: 0.1) : const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? primaryColor : Colors.transparent,
            width: 2,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? primaryColor : Colors.white24,
                  width: 2,
                ),
                color: isSelected ? primaryColor : Colors.transparent,
              ),
              child: isSelected
                  ? const Icon(LucideIcons.check, size: 14, color: Colors.white)
                  : null,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                text,
                style: GoogleFonts.inter(
                  color: Colors.white,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showPassageOverlay(ToeflTaskState state, BuildContext context) {
     showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
             Text(
              "READING PASSAGE",
              style: DesignSystem.labelStyle(buildContext: context, fontSize: 12).copyWith(color: const Color(0xFF3B82F6), fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: SingleChildScrollView(
                child: Text(
                  state.currentReadingPassage ?? "",
                  style: GoogleFonts.inter(color: Colors.white70, fontSize: 14, height: 1.6),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

