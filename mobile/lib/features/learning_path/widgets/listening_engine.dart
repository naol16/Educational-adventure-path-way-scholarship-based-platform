import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';

class ListeningQuestion {
  final String id;
  final String type;
  final String prompt;
  final String audioUrl;
  final List<dynamic> fields;

  ListeningQuestion({
    required this.id,
    required this.type,
    required this.prompt,
    required this.audioUrl,
    required this.fields,
  });
}

class ListeningEngine extends StatefulWidget {
  final ListeningQuestion question;
  final Function(Map<String, String>) onFormSubmitted;

  const ListeningEngine({
    super.key,
    required this.question,
    required this.onFormSubmitted,
  });

  @override
  State<ListeningEngine> createState() => _ListeningEngineState();
}

class _ListeningEngineState extends State<ListeningEngine> {
  double _audioProgress = 0.0;
  bool _isPlaying = false;
  final Map<String, String> _formAnswers = {};
  String? _pathfinderFeedback;

  void _togglePlay() {
    setState(() {
      _isPlaying = !_isPlaying;
      // In a real app, integrate audioplayers or just_audio package here
      if (_isPlaying) {
         _audioProgress = 0.4; // Mock progress for UI visualization
      }
    });
  }

  void _checkAnswer(String fieldId, String value, String? distractor, String? feedbackTip) {
    _formAnswers[fieldId] = value;
    
    // Check if the user fell for "The Echo Trap" distractor
    if (distractor != null && value.toLowerCase().contains(distractor.toLowerCase())) {
      setState(() {
        _pathfinderFeedback = feedbackTip ?? "Pathfinder Tip: Watch out for distractions!";
      });
    } else {
      setState(() {
        _pathfinderFeedback = null;
      });
    }
    
    widget.onFormSubmitted(_formAnswers);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 1. HIGH-END GLASS AUDIO PLAYER
        GlassContainer(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              IconButton(
                icon: Icon(
                  _isPlaying ? LucideIcons.pauseCircle : LucideIcons.playCircle, 
                  color: DesignSystem.emerald,
                  size: 32,
                ),
                onPressed: _togglePlay,
              ),
              Expanded(
                child: SliderTheme(
                  data: SliderTheme.of(context).copyWith(
                    activeTrackColor: DesignSystem.emerald,
                    inactiveTrackColor: DesignSystem.surfaceMediumColor(context),
                    thumbColor: DesignSystem.emerald,
                    overlayColor: DesignSystem.emerald.withValues(alpha: 0.2),
                    trackHeight: 4.0,
                  ),
                  child: Slider(
                    value: _audioProgress,
                    onChanged: (v) {
                      setState(() {
                        _audioProgress = v;
                      });
                    },
                  ),
                ),
              ),
              Text(
                "00:45",
                style: DesignSystem.labelStyle(buildContext: context, fontSize: 10).copyWith(
                  color: DesignSystem.labelText(context),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 30),
        
        // 2. PATHFINDER FEEDBACK OVERLAY (The Echo Trap Trigger)
        if (_pathfinderFeedback != null) ...[
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFF59E0B).withValues(alpha: 0.1), // Amber tint
              border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.5)),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.lightbulb, color: Color(0xFFF59E0B)),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _pathfinderFeedback!,
                    style: GoogleFonts.inter(
                      color: const Color(0xFFF59E0B),
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
        ],

        // 3. DYNAMIC INPUT FIELDS (The Form)
        Text(
          widget.question.prompt,
          style: DesignSystem.headingStyle(buildContext: context, fontSize: 16),
        ),
        const SizedBox(height: 15),
        
        ...widget.question.fields.map((field) {
          return _buildFormField(
            context,
            field['label'] ?? "Answer",
            field['hint'] ?? "Type here...",
            field['distractor'],
            field['feedbackTip'],
          );
        }),
      ],
    );
  }

  Widget _buildFormField(BuildContext context, String label, String hint, String? distractor, String? feedbackTip) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        onChanged: (val) => _checkAnswer(label, val, distractor, feedbackTip),
        style: DesignSystem.bodyStyle(buildContext: context),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: DesignSystem.labelStyle(buildContext: context).copyWith(
            color: DesignSystem.labelText(context),
          ),
          hintText: hint,
          hintStyle: DesignSystem.bodyStyle(buildContext: context).copyWith(
            color: DesignSystem.labelText(context).withValues(alpha: 0.5),
          ),
          filled: true,
          fillColor: DesignSystem.surface(context),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: DesignSystem.glassBorder(context)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: DesignSystem.primary(context)),
          ),
        ),
      ),
    );
  }
}
