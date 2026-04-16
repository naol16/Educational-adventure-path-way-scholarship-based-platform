import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import 'package:mobile/features/interview/providers/interview_provider.dart';
import 'package:mobile/features/interview/models/evaluation_model.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/core/theme/design_system.dart';

class InterviewScreen extends ConsumerStatefulWidget {
  const InterviewScreen({super.key});

  @override
  ConsumerState<InterviewScreen> createState() => _InterviewScreenState();
}

class _InterviewScreenState extends ConsumerState<InterviewScreen> with SingleTickerProviderStateMixin {
  late final AudioRecorder _audioRecorder;
  late AnimationController _pulseController;
  final TextEditingController _countryController = TextEditingController(text: "USA");
  final TextEditingController _universityController = TextEditingController(text: "Stanford University");

  @override
  void initState() {
    super.initState();
    _audioRecorder = AudioRecorder();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _audioRecorder.dispose();
    _pulseController.dispose();
    _countryController.dispose();
    _universityController.dispose();
    super.dispose();
  }

  String _formatTime(int seconds) {
    final mins = (seconds ~/ 60).toString().padLeft(2, '0');
    final secs = (seconds % 60).toString().padLeft(2, '0');
    return "$mins:$secs";
  }

  Future<void> _startRecording() async {
    final state = ref.read(interviewProvider);
    if (state.isMuted) return;

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
    final state = ref.read(interviewProvider);
    if (!state.isRecording) return;

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
      backgroundColor: DesignSystem.background,
      body: Stack(
        children: [
          // Background Glows
          Positioned(
            top: 200, 
            left: 50, 
            child: DesignSystem.buildBlurCircle(DesignSystem.emerald.withOpacity(0.08), 300)
          ),

          SafeArea(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator(color: DesignSystem.emerald))
                : state.evaluationData != null 
                    ? _buildEvaluationResults(state.evaluationData!)
                    : _buildLiveInterface(state),
          ),
        ],
      ),
    );
  }

  Widget _buildLiveInterface(InterviewState state) {
    if (state.messages.isEmpty && !state.isLoading) {
      return _buildSetupView();
    }

    return Column(
      children: [
        const SizedBox(height: 20),
        _buildHeader(state.remainingSeconds),
        const SizedBox(height: 40),
        _buildQuestionCard(state.currentPrompt),
        const Spacer(),
        
        // THE GLOWING AI ORB
        GestureDetector(
          onLongPressStart: (_) => _startRecording(),
          onLongPressEnd: (_) => _stopRecording(),
          child: _buildAIOrb(state.isRecording, state.isMuted),
        ),
        
        const SizedBox(height: 20),
        Text(
          state.isMuted 
              ? "Microphone Muted" 
              : (state.isRecording ? "Listening..." : (state.isSending ? "Processing..." : "Hold to Talk")),
          style: GoogleFonts.inter(
            color: state.isMuted ? Colors.redAccent : DesignSystem.emerald.withOpacity(0.7), 
            fontWeight: FontWeight.bold, 
            letterSpacing: 1
          ),
        ),
        
        const Spacer(),
        _buildLiveMetrics(state.metrics),
        const SizedBox(height: 40),
        _buildControlBar(state.isMuted),
        const SizedBox(height: 20),
      ],
    );
  }

  Widget _buildSetupView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 30),
        child: GlassContainer(
          padding: const EdgeInsets.all(30),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text("INTERVIEW SETUP", style: DesignSystem.headingStyle(fontSize: 20, color: DesignSystem.emerald)),
              const SizedBox(height: 25),
              _buildInputField("Target Country", _countryController),
              const SizedBox(height: 15),
              _buildInputField("University Name", _universityController),
              const SizedBox(height: 30),
              ElevatedButton.icon(
                onPressed: () => ref.read(interviewProvider.notifier).startInterview(
                  country: _countryController.text,
                  university: _universityController.text,
                ),
                icon: const Icon(LucideIcons.play),
                label: Text("Start Speaking Lab", style: GoogleFonts.plusJakartaSans(fontSize: 16, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: DesignSystem.emerald,
                  foregroundColor: Colors.black,
                  minimumSize: const Size(double.infinity, 56),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInputField(String label, TextEditingController controller) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.inter(color: Colors.white54, fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          style: GoogleFonts.inter(color: Colors.white),
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.black26,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          ),
        ),
      ],
    );
  }

  Widget _buildHeader(int remainingSeconds) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
          Column(
            children: [
              Text("SPEAKING LAB", style: GoogleFonts.plusJakartaSans(color: DesignSystem.emerald, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2)),
              Text(_formatTime(remainingSeconds), style: GoogleFonts.plusJakartaSans(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            ],
          ),
          const Icon(LucideIcons.settings, color: Colors.white38),
        ],
      ),
    );
  }

  Widget _buildQuestionCard(String question) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 30),
      child: GlassContainer(
        padding: const EdgeInsets.all(24),
        child: Text(
          "\"$question\"",
          textAlign: TextAlign.center,
          style: GoogleFonts.plusJakartaSans(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700, height: 1.4),
        ),
      ),
    );
  }

  Widget _buildAIOrb(bool isPulse, bool isMuted) {
    return AnimatedBuilder(
      animation: _pulseController,
      builder: (context, child) {
        double pulseVal = isPulse ? _pulseController.value : 0.0;
        Color orbColor = isMuted ? Colors.redAccent : DesignSystem.emerald;
        return Stack(
          alignment: Alignment.center,
          children: [
            // Outer pulsing rings
            _buildPulseRing(180 + (40 * pulseVal), 0.1 * (1 - pulseVal), color: orbColor),
            _buildPulseRing(140 + (30 * pulseVal), 0.2 * (1 - pulseVal), color: orbColor),
            // The main Orb
            Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [orbColor, isMuted ? Colors.red.shade900 : const Color(0xFF059669)],
                ),
                boxShadow: [
                  BoxShadow(
                    color: orbColor.withOpacity(0.5 + (0.2 * pulseVal)),
                    blurRadius: 40 + (20 * pulseVal),
                    spreadRadius: 5 + (5 * pulseVal)
                  ),
                ],
              ),
              child: Icon(isMuted ? LucideIcons.micOff : LucideIcons.mic, color: isMuted ? Colors.white : Colors.black, size: 40),
            ),
          ],
        );
      },
    );
  }

  Widget _buildPulseRing(double size, double opacity, {Color? color}) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: (color ?? DesignSystem.emerald).withOpacity(opacity), width: 2),
      ),
    );
  }

  Widget _buildLiveMetrics(InterviewMetrics metrics) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildMetric("FLUENCY", metrics.fluency),
          _buildMetric("PACE", metrics.pace),
          _buildMetric("GRAMMAR", metrics.grammar),
        ],
      ),
    );
  }

  Widget _buildMetric(String label, double val) {
    return Column(
      children: [
        SizedBox(
          width: 50, height: 50,
          child: CircularProgressIndicator(value: val, strokeWidth: 3, backgroundColor: Colors.white10, valueColor: const AlwaysStoppedAnimation(DesignSystem.emerald)),
        ),
        const SizedBox(height: 10),
        Text(label, style: GoogleFonts.inter(color: Colors.white38, fontSize: 8, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildControlBar(bool isMuted) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: GlassContainer(
        padding: const EdgeInsets.all(12),
        borderRadius: 30,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            IconButton(
              icon: Icon(isMuted ? LucideIcons.micOff : LucideIcons.mic, color: isMuted ? Colors.redAccent : Colors.white38),
              onPressed: () => ref.read(interviewProvider.notifier).toggleMute(),
            ),
            GestureDetector(
              onTap: () => ref.read(interviewProvider.notifier).endInterview(),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: BoxDecoration(color: Colors.redAccent.withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.redAccent.withOpacity(0.2))),
                child: Text("END SESSION", style: GoogleFonts.plusJakartaSans(color: Colors.redAccent, fontWeight: FontWeight.w900, fontSize: 12)),
              ),
            ),
            IconButton(
              icon: const Icon(LucideIcons.sparkles, color: DesignSystem.emerald),
              onPressed: () {
                final state = ref.read(interviewProvider);
                String hint = "Try to expand on your reasons.";
                if (state.messages.isNotEmpty) {
                  hint = "Pathfinder: Mention specific details about the university's curriculum.";
                }
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(hint),
                    backgroundColor: DesignSystem.background,
                    behavior: SnackBarBehavior.floating,
                  )
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEvaluationResults(EvaluationModel eval) {
    return SingleChildScrollView(
      padding: const EdgeInsets.only(left: 24, right: 24, top: 24, bottom: 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Icon(LucideIcons.award, size: 64, color: DesignSystem.emerald),
          const SizedBox(height: 16),
          Text(
            "Interview Complete",
            textAlign: TextAlign.center,
            style: DesignSystem.headingStyle(fontSize: 24),
          ),
          const SizedBox(height: 32),
          
          GlassContainer(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildStatRow(LucideIcons.barChart, "Band Score", eval.bandScore),
                const Divider(height: 32, color: Colors.white12),
                _buildStatRow(LucideIcons.checkSquare, "Grammar", eval.grammar),
                const Divider(height: 32, color: Colors.white12),
                _buildStatRow(LucideIcons.smile, "Confidence", eval.confidence),
              ],
            ),
          ),
          
          const SizedBox(height: 32),
          Text(
            "Detailed Feedback",
            style: DesignSystem.headingStyle(fontSize: 18),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              eval.feedback,
              style: GoogleFonts.inter(height: 1.6, color: Colors.white70, fontSize: 15),
            ),
          ),
          const SizedBox(height: 40),
          ElevatedButton(
            onPressed: () {
              ref.read(interviewProvider.notifier).startInterview();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: DesignSystem.emerald,
              foregroundColor: Colors.black,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            child: Text("Try Another Interview", style: GoogleFonts.plusJakartaSans(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildStatRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: DesignSystem.emerald.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: DesignSystem.emerald, size: 24),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: GoogleFonts.inter(color: Colors.white54, fontSize: 14)),
              const SizedBox(height: 4),
              Text(value, style: GoogleFonts.plusJakartaSans(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ],
    );
  }
}
