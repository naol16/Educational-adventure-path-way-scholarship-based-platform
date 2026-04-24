import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/core/providers/dependencies.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/learning_path/providers/learning_path_provider.dart';
import 'package:lottie/lottie.dart';
import 'package:flutter_tts/flutter_tts.dart';
 
class UnitTestScreen extends ConsumerStatefulWidget {
  final String skill;
  final String level;
  final int missionIndex;

  const UnitTestScreen({
    super.key,
    required this.skill,
    required this.level,
    required this.missionIndex,
  });

  @override
  ConsumerState<UnitTestScreen> createState() => _UnitTestScreenState();
}

class _UnitTestScreenState extends ConsumerState<UnitTestScreen> {
  bool _isLoading = true;
  List<dynamic> _questions = [];
  int _currentIndex = 0;
  int? _selectedOption;
  final List<Map<String, dynamic>> _userResponses = [];
  bool _isEvaluating = false;
  Map<String, dynamic>? _results;
  String? _passage;
  String? _script;
  bool _isPassageExpanded = false;
  bool _hasListened = false;
  final FlutterTts _tts = FlutterTts();
  bool _isTtsInitialized = false;

  @override
  void initState() {
    super.initState();
    _loadTest();
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

  @override
  void dispose() {
    if (_isTtsInitialized) {
      _tts.stop();
    }
    super.dispose();
  }

  Future<void> _loadTest() async {
    try {
      final api = ref.read(learningPathApiServiceProvider);
      final data = await api.generateUnitTest(
        skill: widget.skill,
        level: widget.level,
      );
      if (mounted) {
        setState(() {
          _questions = data['questions'] ?? [];
          _passage = data['passage'];
          _script = data['script'];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Failed to load test: $e")),
        );
        Navigator.pop(context);
      }
    }
  }

  void _nextQuestion() {
    if (_selectedOption != null) {
      final currentQ = _questions[_currentIndex];
      _userResponses.add({
        'questionIndex': _currentIndex,
        'selectedOption': _selectedOption,
        'isCorrect': _selectedOption == currentQ['correct_answer'],
      });

      if (_currentIndex < _questions.length - 1) {
        setState(() {
          _currentIndex++;
          _selectedOption = null;
        });
      } else {
        _submitTest();
      }
    }
  }

  Future<void> _submitTest() async {
    setState(() => _isEvaluating = true);
    try {
      final api = ref.read(learningPathApiServiceProvider);
      final results = await api.submitUnitTest(
        skill: widget.skill,
        responses: _userResponses,
        missionIndex: widget.missionIndex,
      );
      
      // Reload path to reflect mastery
      await ref.read(learningPathProvider.notifier).reload();

      if (mounted) {
        setState(() {
          _results = results;
          _isEvaluating = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isEvaluating = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Submission failed: $e")),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: DesignSystem.themeBackground(context),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: DesignSystem.primary(context)),
              const SizedBox(height: 20),
              Text(
                "Generating Unit Test...",
                style: DesignSystem.labelStyle(buildContext: context),
              ),
            ],
          ),
        ),
      );
    }

    if (_results != null) {
      return _buildResultsView();
    }

    final question = _questions[_currentIndex];
    final options = (question['options'] as List<dynamic>?) ?? [];

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          "MASTERY TEST: ${widget.skill.toUpperCase()}",
          style: DesignSystem.headingStyle(buildContext: context, fontSize: 16),
        ),
        centerTitle: true,
      ),
      body: Stack(
        children: [
          SafeArea(
            child: Column(
              children: [
                if (_passage != null || _script != null)
                  _buildCollapsibleHeader(context),
                  
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        LinearProgressIndicator(
                          value: (_currentIndex + 1) / _questions.length,
                          backgroundColor: DesignSystem.surface(context),
                          valueColor: AlwaysStoppedAnimation(DesignSystem.primary(context)),
                        ),
                        const SizedBox(height: 32),
                        Text(
                          "Question ${_currentIndex + 1} of ${_questions.length}",
                          style: DesignSystem.labelStyle(buildContext: context, fontSize: 12),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          question['question'] ?? "",
                          style: DesignSystem.headingStyle(buildContext: context, fontSize: 18),
                        ),
                        const SizedBox(height: 32),
                        ...options.asMap().entries.map((entry) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _buildOption(entry.key, entry.value.toString()),
                        )),
                        const SizedBox(height: 40),
                        PrimaryButton(
                          text: _currentIndex < _questions.length - 1 ? "NEXT QUESTION" : "FINISH TEST",
                          onPressed: _selectedOption == null ? null : _nextQuestion,
                          isLoading: _isEvaluating,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          if (_isPassageExpanded && _passage != null)
            _buildPassageOverlay(context),
        ],
      ),
    );
  }

  Widget _buildOption(int index, String text) {
    final isSelected = _selectedOption == index;
    final primaryColor = DesignSystem.primary(context);

    return GestureDetector(
      onTap: () => setState(() => _selectedOption = index),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? primaryColor.withValues(alpha: 0.1) : DesignSystem.surface(context),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? primaryColor : Colors.transparent,
            width: 2,
          ),
        ),
        child: Text(
          text,
          style: GoogleFonts.inter(
            color: DesignSystem.mainText(context),
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildResultsView() {
    final passed = _results!['passed'] ?? false;
    final score = _results!['score'] ?? 0;
    final color = passed ? DesignSystem.emerald : Colors.red;

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: Stack(
        children: [
          // Celebratory Lottie Background
          if (passed)
            Positioned.fill(
              child: Lottie.network(
                'https://lottie.host/80242295-d86b-4e6c-947f-856114a796e6/oR0p0U1Y8H.json',
                fit: BoxFit.cover,
                repeat: false,
                errorBuilder: (context, error, stackTrace) => const SizedBox.shrink(),
              ),
            ),
          
          Positioned.fill(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (passed)
                  Lottie.network(
                    'https://lottie.host/8b4618e4-7f15-46f4-b25b-5517b6a18837/9v6v9vX9vG.json',
                    width: 200,
                    height: 200,
                    repeat: false,
                    errorBuilder: (context, error, stackTrace) => const Icon(
                      LucideIcons.checkCircle2,
                      size: 100,
                      color: DesignSystem.emerald,
                    ),
                  )
                else
                  Icon(
                    LucideIcons.alertCircle,
                    size: 80,
                    color: color,
                  ),
                const SizedBox(height: 24),
                Text(
                  passed ? "MASTERY ACHIEVED!" : "KEEP PRACTICING",
                  style: DesignSystem.headingStyle(buildContext: context, fontSize: 28).copyWith(
                    color: color,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  "You scored ${score.toInt()}%",
                  style: DesignSystem.labelStyle(buildContext: context, fontSize: 18),
                ),
                const SizedBox(height: 24),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                  child: Text(
                    _results!['feedback'] ?? "",
                    textAlign: TextAlign.center,
                    style: DesignSystem.bodyStyle(buildContext: context, fontSize: 16),
                  ),
                ),
                const SizedBox(height: 48),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                  child: PrimaryButton(
                    text: "RETURN TO HUB",
                    onPressed: () => Navigator.pop(context),
                  ),
                ),
              ],
            ),
          ),
          
          // Confetti overlay for pass
          if (passed)
            Positioned.fill(
              child: IgnorePointer(
                child: Lottie.network(
                  'https://lottie.host/7970d440-272e-4b47-b845-671e6261548e/8zS6D090V2.json',
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) => const SizedBox.shrink(),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildCollapsibleHeader(BuildContext context) {
    final isReading = widget.skill.toLowerCase().contains('reading');
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

  void _listenOnce() async {
    if (_script != null && !_hasListened && _isTtsInitialized) {
      setState(() {
        _hasListened = true;
      });
      await _tts.speak(_script!);
    }
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
                          _passage!,
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
}
