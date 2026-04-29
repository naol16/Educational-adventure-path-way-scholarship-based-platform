import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/learning_path/providers/mock_exam_provider.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';

class SpeakingSectionWidget extends ConsumerStatefulWidget {
  const SpeakingSectionWidget({super.key});

  @override
  ConsumerState<SpeakingSectionWidget> createState() => _SpeakingSectionWidgetState();
}

class _SpeakingSectionWidgetState extends ConsumerState<SpeakingSectionWidget> {
  final AudioRecorder _recorder = AudioRecorder();
  bool _isRecording = false;
  int _recordingSeconds = 0;
  String? _recordingPath;
  bool _hasRecording = false;
  final _textController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final existing = ref.read(mockExamProvider).answers['speaking_text'] as String? ?? '';
    _textController.text = existing;
    _textController.addListener(() {
      ref.read(mockExamProvider.notifier).updateAnswer('speaking_text', _textController.text);
    });
  }

  @override
  void dispose() {
    _recorder.dispose();
    _textController.dispose();
    super.dispose();
  }

  Future<void> _startRecording() async {
    final hasPermission = await _recorder.hasPermission();
    if (!hasPermission) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Microphone permission denied.')),
        );
      }
      return;
    }
    final dir = await getTemporaryDirectory();
    final path = '${dir.path}/speaking_${DateTime.now().millisecondsSinceEpoch}.m4a';
    await _recorder.start(const RecordConfig(encoder: AudioEncoder.aacLc), path: path);
    setState(() {
      _isRecording = true;
      _recordingSeconds = 0;
      _recordingPath = path;
    });
    _tickTimer();
  }

  void _tickTimer() {
    Future.delayed(const Duration(seconds: 1), () {
      if (!mounted || !_isRecording) return;
      setState(() => _recordingSeconds++);
      _tickTimer();
    });
  }

  Future<void> _stopRecording() async {
    await _recorder.stop();
    setState(() => _isRecording = false);
    if (_recordingPath != null) {
      final bytes = await File(_recordingPath!).readAsBytes();
      ref.read(mockExamProvider.notifier).updateAnswer('speaking_audio', bytes.toList());
      setState(() => _hasRecording = true);
    }
  }

  String _fmt(int s) {
    final m = (s ~/ 60).toString().padLeft(2, '0');
    final sec = (s % 60).toString().padLeft(2, '0');
    return '$m:$sec';
  }

  @override
  Widget build(BuildContext context) {
    final prompt = ref.watch(mockExamProvider.select((s) => s.blueprint?.sections.speaking?.prompt ?? ''));
    final primary = DesignSystem.primary(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Prompt card
          GlassContainer(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(LucideIcons.mic, size: 16, color: primary),
                    const SizedBox(width: 8),
                    Text('Speaking Task',
                        style: DesignSystem.headingStyle(buildContext: context, fontSize: 15)),
                  ],
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: DesignSystem.surface(context),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    prompt.isNotEmpty ? prompt : 'No prompt provided.',
                    style: DesignSystem.bodyStyle(buildContext: context, fontSize: 14)
                        .copyWith(height: 1.6),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Recording UI
          GlassContainer(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Text('Record Your Response',
                    style: DesignSystem.headingStyle(buildContext: context, fontSize: 15)),
                const SizedBox(height: 6),
                Text('Tap the button to start speaking',
                    style: DesignSystem.labelStyle(buildContext: context, fontSize: 12)),
                const SizedBox(height: 28),

                // Mic orb
                GestureDetector(
                  onTap: _isRecording ? _stopRecording : _startRecording,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    width: 88, height: 88,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _isRecording
                          ? const Color(0xFFF87171)
                          : primary,
                      boxShadow: [
                        BoxShadow(
                          color: (_isRecording ? const Color(0xFFF87171) : primary)
                              .withValues(alpha: 0.4),
                          blurRadius: _isRecording ? 24 : 12,
                          spreadRadius: _isRecording ? 4 : 0,
                        ),
                      ],
                    ),
                    child: Icon(
                      _isRecording ? LucideIcons.stopCircle : LucideIcons.mic,
                      color: Colors.white,
                      size: 34,
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                if (_isRecording) ...[
                  Text(
                    'Recording... ${_fmt(_recordingSeconds)}',
                    style: GoogleFonts.inter(
                        color: const Color(0xFFF87171), fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 4),
                  Text('Tap to stop', style: DesignSystem.labelStyle(buildContext: context, fontSize: 11)),
                ] else if (_hasRecording) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: primary.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(LucideIcons.checkCircle, size: 14, color: primary),
                        const SizedBox(width: 6),
                        Text('Audio recorded (${_fmt(_recordingSeconds)})',
                            style: GoogleFonts.inter(color: primary, fontWeight: FontWeight.w600, fontSize: 12)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextButton.icon(
                    onPressed: () {
                      setState(() { _hasRecording = false; _recordingSeconds = 0; });
                      ref.read(mockExamProvider.notifier).updateAnswer('speaking_audio', null);
                    },
                    icon: const Icon(LucideIcons.refreshCcw, size: 13),
                    label: const Text('Re-record'),
                    style: TextButton.styleFrom(foregroundColor: DesignSystem.labelText(context)),
                  ),
                ] else ...[
                  Text('Tap to start speaking',
                      style: DesignSystem.labelStyle(buildContext: context, fontSize: 12)),
                ],
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Divider
          Row(
            children: [
              Expanded(child: Divider(color: DesignSystem.glassBorder(context))),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Text('OR TYPE YOUR RESPONSE',
                    style: DesignSystem.labelStyle(buildContext: context, fontSize: 10)
                        .copyWith(letterSpacing: 1)),
              ),
              Expanded(child: Divider(color: DesignSystem.glassBorder(context))),
            ],
          ),
          const SizedBox(height: 16),

          // Text fallback
          TextField(
            controller: _textController,
            maxLines: 5,
            style: GoogleFonts.inter(color: DesignSystem.mainText(context), fontSize: 13, height: 1.6),
            decoration: InputDecoration(
              hintText: 'If you cannot record, type what you would say here...',
              hintStyle: GoogleFonts.inter(
                  color: DesignSystem.labelText(context).withValues(alpha: 0.4), fontSize: 12),
              filled: true,
              fillColor: DesignSystem.surface(context),
              contentPadding: const EdgeInsets.all(14),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: DesignSystem.glassBorder(context)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: DesignSystem.primary(context), width: 1.5),
              ),
            ),
          ),
          const SizedBox(height: 80),
        ],
      ),
    );
  }
}
