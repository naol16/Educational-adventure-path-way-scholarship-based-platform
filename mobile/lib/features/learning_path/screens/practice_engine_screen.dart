import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/learning_path/providers/learning_path_provider.dart';
import 'package:flutter_tts/flutter_tts.dart';

class PracticeEngineScreen extends ConsumerStatefulWidget {
  final String section;
  final List<dynamic> questions;

  final String? passage;
  final String? script;

  const PracticeEngineScreen({
    super.key,
    required this.section,
    required this.questions,
    this.passage,
    this.script,
  });

  @override
  ConsumerState<PracticeEngineScreen> createState() => _PracticeEngineScreenState();
}

class _PracticeEngineScreenState extends ConsumerState<PracticeEngineScreen> {
  int _currentIndex = 0;
  int? _selectedOption;
  bool _showFeedback = false;
  bool _isPassageExpanded = false;
  bool _hasListened = false;
  final FlutterTts _tts = FlutterTts();
  bool _isTtsInitialized = false;

  @override
  void initState() {
    super.initState();
    _initTts();
  }

  Future<void> _initTts() async {
    try {
      await _tts.setLanguage("en-US");
      await _tts.setSpeechRate(0.5);
      await _tts.setVolume(1.0);
      setState(() {
        _isTtsInitialized = true;
      });
    } catch (e) {
      debugPrint("TTS Init Error: $e");
    }
  }

  void _listenOnce() async {
    if (widget.script != null && !_hasListened && _isTtsInitialized) {
      setState(() {
        _hasListened = true;
      });
      await _tts.speak(widget.script!);
    }
  }

  @override
  void dispose() {
    if (_isTtsInitialized) {
      _tts.stop();
    }
    super.dispose();
  }

  void _submitAnswer() async {
    if (_selectedOption != null && !_showFeedback) {
      final question = widget.questions[_currentIndex];
      final options = question['options'] as List<dynamic>;
      options[_selectedOption!].toString();

      // Mark progress on backend
      await ref.read(learningPathProvider.notifier).markProgress(
        section: widget.section,
        questionIndex: _currentIndex,
        isCompleted: true,
      );

      setState(() {
        _showFeedback = true;
      });
    } else if (_showFeedback) {
      if (_currentIndex < widget.questions.length - 1) {
        setState(() {
          _currentIndex++;
          _selectedOption = null;
          _showFeedback = false;
        });
      } else {
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.questions.isEmpty) {
      return Scaffold(
        backgroundColor: DesignSystem.themeBackground(context),
        body: Center(child: Text("No questions available for this module.")),
      );
    }

    final question = widget.questions[_currentIndex];
    final options = (question['options'] as List<dynamic>?) ?? [];
    final correctIdx = _findCorrectIndex(question, options);

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(LucideIcons.arrowLeft, color: DesignSystem.mainText(context)),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          "PRACTICE DRILL: ${widget.section.toUpperCase()}",
          style: DesignSystem.labelStyle(buildContext: context, fontSize: 12).copyWith(
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
            color: DesignSystem.primary(context),
          ),
        ),
        centerTitle: true,
      ),
      body: Stack(
        children: [
          Positioned(
            top: -50,
            right: -50,
            child: _buildBlurCircle(DesignSystem.emerald.withValues(alpha: 0.05), 300),
          ),
          
          SafeArea(
            child: Column(
              children: [
                if (widget.passage != null || widget.script != null)
                  _buildCollapsibleHeader(context),
                
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Question ${_currentIndex + 1} of ${widget.questions.length}",
                          style: DesignSystem.labelStyle(buildContext: context, fontSize: 12),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          question['question'] ?? question['prompt'] ?? "No question text",
                          style: DesignSystem.headingStyle(buildContext: context, fontSize: 18),
                        ),
                        const SizedBox(height: 32),
                        
                        ...options.asMap().entries.map((entry) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _buildOption(context, entry.key, entry.value.toString(), correctIdx),
                        )),
                        
                        const SizedBox(height: 40),
                        
                        PrimaryButton(
                          text: _showFeedback 
                              ? (_currentIndex < widget.questions.length - 1 ? "NEXT QUESTION" : "FINISH DRILL") 
                              : "SUBMIT ANSWER",
                          onPressed: _selectedOption == null && !_showFeedback ? null : _submitAnswer,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          if (_isPassageExpanded && widget.passage != null)
            _buildPassageOverlay(context),
          
          if (_showFeedback)
            Positioned.fill(
              child: _buildFeedbackOverlay(context, question, correctIdx),
            ),
        ],
      ),
    );
  }

  int _findCorrectIndex(dynamic question, List<dynamic> options) {
    final correct = question['correct_answer'] ?? question['answer'];
    if (correct == null) return -1;
    
    // If it's an index already
    if (correct is int) return correct;
    
    // If it's text, find it in options
    return options.indexWhere((opt) => opt.toString().toLowerCase() == correct.toString().toLowerCase());
  }

  Widget _buildOption(BuildContext context, int index, String text, int correctIdx) {
    final isSelected = _selectedOption == index;
    final primaryColor = DesignSystem.primary(context);
    
    Color borderColor = Colors.transparent;
    Color bgColor = DesignSystem.surface(context);
    
    if (isSelected) {
      borderColor = primaryColor;
      bgColor = primaryColor.withValues(alpha: 0.1);
    }
    
    if (_showFeedback) {
      if (index == correctIdx) {
        borderColor = DesignSystem.emerald;
        bgColor = DesignSystem.emerald.withValues(alpha: 0.1);
      } else if (isSelected && index != correctIdx) {
        borderColor = const Color(0xFFF43F5E); // Red
        bgColor = const Color(0xFFF43F5E).withValues(alpha: 0.1);
      }
    }

    return GestureDetector(
      onTap: _showFeedback ? null : () {
        setState(() {
          _selectedOption = index;
        });
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: borderColor,
            width: 2,
          ),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                text,
                style: GoogleFonts.inter(
                  color: DesignSystem.mainText(context),
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ),
            if (_showFeedback && index == correctIdx)
              Icon(LucideIcons.checkCircle, color: DesignSystem.emerald, size: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildFeedbackOverlay(BuildContext context, dynamic question, int correctIdx) {
    final isCorrect = _selectedOption == correctIdx;
    final color = isCorrect ? DesignSystem.emerald : const Color(0xFFF43F5E);
    final icon = isCorrect ? LucideIcons.checkCircle : LucideIcons.xCircle;
    final title = isCorrect ? "Correct!" : "Incorrect";
    final explanation = question['explanation'] ?? "The correct answer is highlighted in green.";

    return Container(
      color: Colors.black.withValues(alpha: 0.5),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: DesignSystem.themeBackground(context).withValues(alpha: 0.8),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: color.withValues(alpha: 0.5)),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(icon, size: 48, color: color),
                    const SizedBox(height: 16),
                    Text(
                      title,
                      style: DesignSystem.headingStyle(buildContext: context, fontSize: 24).copyWith(color: color),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      explanation,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(
                        color: DesignSystem.mainText(context).withValues(alpha: 0.8),
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCollapsibleHeader(BuildContext context) {
    final isReading = widget.section.toLowerCase().contains('reading');
    final title = isReading ? "READING PASSAGE" : "LISTENING AUDIO";
    final icon = isReading ? LucideIcons.bookOpen : LucideIcons.headphones;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      child: GestureDetector(
        onTap: () {
          if (isReading) {
            setState(() {
              _isPassageExpanded = !_isPassageExpanded;
            });
          } else {
            _listenOnce();
          }
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: DesignSystem.primary(context).withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: DesignSystem.primary(context).withValues(alpha: 0.3)),
          ),
          child: Row(
            children: [
              Icon(icon, size: 18, color: DesignSystem.primary(context)),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  title,
                  style: DesignSystem.labelStyle(buildContext: context, fontSize: 12).copyWith(
                    color: DesignSystem.primary(context),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              if (isReading)
                Icon(
                  _isPassageExpanded ? LucideIcons.chevronUp : LucideIcons.chevronDown,
                  size: 18,
                  color: DesignSystem.primary(context),
                )
              else
                Text(
                  _hasListened ? "LISTENED" : "PLAY ONCE",
                  style: DesignSystem.labelStyle(buildContext: context, fontSize: 10).copyWith(
                    color: _hasListened ? DesignSystem.labelText(context) : DesignSystem.primary(context),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPassageOverlay(BuildContext context) {
    return Positioned.fill(
      child: GestureDetector(
        onTap: () => setState(() => _isPassageExpanded = false),
        child: Container(
          color: Colors.black.withValues(alpha: 0.7),
          child: SafeArea(
            child: Center(
              child: Container(
                margin: const EdgeInsets.all(24),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: DesignSystem.themeBackground(context),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: DesignSystem.primary(context).withValues(alpha: 0.2)),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          "READING PASSAGE",
                          style: DesignSystem.labelStyle(buildContext: context).copyWith(fontWeight: FontWeight.bold),
                        ),
                        IconButton(
                          icon: Icon(LucideIcons.x, size: 20, color: DesignSystem.mainText(context)),
                          onPressed: () => setState(() => _isPassageExpanded = false),
                        ),
                      ],
                    ),
                    const Divider(),
                    Expanded(
                      child: SingleChildScrollView(
                        child: Text(
                          widget.passage!,
                          style: DesignSystem.bodyStyle(buildContext: context, fontSize: 16).copyWith(height: 1.6),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    PrimaryButton(
                      text: "BACK TO QUESTIONS",
                      onPressed: () => setState(() => _isPassageExpanded = false),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBlurCircle(Color color, double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
        boxShadow: [BoxShadow(color: color, blurRadius: 100, spreadRadius: 50)],
      ),
    );
  }
}
