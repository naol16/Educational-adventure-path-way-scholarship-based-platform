import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';

import '../../../utils/app_colors.dart';
import '../providers/interview_provider.dart';

class InterviewScreen extends ConsumerStatefulWidget {
  const InterviewScreen({super.key});

  @override
  ConsumerState<InterviewScreen> createState() => _InterviewScreenState();
}

class _InterviewScreenState extends ConsumerState<InterviewScreen> {
  late final AudioRecorder _audioRecorder;

  @override
  void initState() {
    super.initState();
    _audioRecorder = AudioRecorder();
    // Auto-generate test upon opening
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(interviewProvider.notifier).generateTest();
    });
  }

  @override
  void dispose() {
    _audioRecorder.dispose();
    super.dispose();
  }

  Future<void> _startRecording() async {
    try {
      if (await _audioRecorder.hasPermission()) {
        final dir = await getApplicationDocumentsDirectory();
        final path = '${dir.path}/interview_response.m4a';
        
        await _audioRecorder.start(
          const RecordConfig(encoder: AudioEncoder.aacLc),
          path: path,
        );
        
        ref.read(interviewProvider.notifier).toggleRecording(true);
      }
    } catch (e) {
      debugPrint("Recording Error: $e");
    }
  }

  Future<void> _stopRecording() async {
    try {
      final path = await _audioRecorder.stop();
      ref.read(interviewProvider.notifier).toggleRecording(false);
      
      if (path != null) {
        await ref.read(interviewProvider.notifier).submitAudio(path);
      }
    } catch (e) {
       debugPrint("Stop Recording Error: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(interviewProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Voice Assessment')),
      body: SafeArea(
        child: state.isLoading
            ? const Center(child: CircularProgressIndicator())
            : Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          const Icon(Icons.record_voice_over, size: 64, color: AppColors.primary),
                          const SizedBox(height: 24),
                          Text(
                            state.currentPrompt,
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                    const Spacer(),
                    
                    if (state.error != null)
                       Padding(
                         padding: const EdgeInsets.only(bottom: 16),
                         child: Text(state.error!, textAlign: TextAlign.center, style: const TextStyle(color: Colors.red)),
                       ),
                       
                    if (state.isSending)
                      const Column(
                        children: [
                          CircularProgressIndicator(),
                          SizedBox(height: 16),
                          Text("Analyzing your response..."),
                        ],
                      )
                    else 
                      GestureDetector(
                        onLongPressStart: (_) => _startRecording(),
                        onLongPressEnd: (_) => _stopRecording(),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          height: state.isRecording ? 120 : 100,
                          width: state.isRecording ? 120 : 100,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: state.isRecording ? Colors.red : AppColors.primary,
                            boxShadow: [
                              if (state.isRecording)
                                BoxShadow(
                                  color: Colors.red.withOpacity(0.5),
                                  blurRadius: 30,
                                  spreadRadius: 10,
                                )
                            ],
                          ),
                          child: Icon(
                            state.isRecording ? Icons.mic : Icons.mic_none,
                            color: Colors.white,
                            size: 48,
                          ),
                        ),
                      ),
                    const SizedBox(height: 24),
                    Text(
                      state.isRecording ? "Release to Send" : "Hold to Speak",
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: AppColors.textLight, fontWeight: FontWeight.w500),
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
      ),
    );
  }
}
