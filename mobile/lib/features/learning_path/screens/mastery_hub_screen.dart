import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart'; // Using your existing widget
import 'package:mobile/features/learning_path/screens/mission_detail_screen.dart';
import 'package:mobile/models/learning_mission.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/learning_path/providers/learning_path_provider.dart';
import 'package:mobile/features/learning_path/screens/diagnostic_assessment_screen.dart';
import 'dart:io';
import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:mobile/features/learning_path/models/learning_path.dart';
import 'package:mobile/core/providers/dependencies.dart';

class MasteryHubScreen extends ConsumerStatefulWidget {
  const MasteryHubScreen({super.key});

  @override
  ConsumerState<MasteryHubScreen> createState() => _MasteryHubScreenState();
}

class _MasteryHubScreenState extends ConsumerState<MasteryHubScreen> with TickerProviderStateMixin {
  String _selectedTab = 'Reading';
  late AnimationController _staggerController;
  bool _hasTriggeredIntro = false;

  @override
  void initState() {
    super.initState();
    _staggerController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    );
  }

  @override
  void dispose() {
    _staggerController.dispose();
    super.dispose();
  }

  void _startAssessment({bool force = false}) async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => DiagnosticAssessmentScreen(force: force),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pathState = ref.watch(learningPathProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final path = pathState.valueOrNull;

    if (path != null && !_hasTriggeredIntro) {
      _hasTriggeredIntro = true;
      _staggerController.forward(from: 0.0);
    }
    final primaryColor = DesignSystem.primary(context);

    return Scaffold(
      backgroundColor: isDark
          ? DesignSystem.background
          : DesignSystem.backgroundLight,
      body: Stack(
        children: [
          // Background Depth
          Positioned(
            top: -50,
            left: -50,
            child: _buildBlurCircle(primaryColor.withValues(alpha: 0.05), 250),
          ),

          SafeArea(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 800),
              child: pathState.when(
                data: (path) => path != null 
                  ? _buildHubContent(context, path) 
                  : _buildAssessmentPrompt(context),
                loading: () => Center(child: CircularProgressIndicator(color: primaryColor)),
                error: (err, stack) => _buildErrorState(context, err),
              ),
            ),
          ),

          // Pathfinder Floating Insight (only show when assessment is done)
          if (path != null)
            Positioned(
              bottom: 100,
              left: 0,
              child: _buildPathfinderBubble(context, path),
            ),
        ],
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, Object error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(LucideIcons.alertTriangle, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            Text("Oops! Something went wrong", style: DesignSystem.headingStyle(buildContext: context, fontSize: 18)),
            const SizedBox(height: 8),
            Text(error.toString(), textAlign: TextAlign.center, style: DesignSystem.labelStyle(buildContext: context)),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => ref.read(learningPathProvider.notifier).reload(),
              child: const Text("RETRY"),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAssessmentPrompt(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              LucideIcons.compass,
              size: 64,
              color: DesignSystem.primary(context),
            ),
            const SizedBox(height: 24),
            Text(
              "Begin Your Journey",
              style: DesignSystem.headingStyle(
                buildContext: context,
                fontSize: 24,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              "Take the diagnostic assessment to unlock your personalized learning path.",
              textAlign: TextAlign.center,
              style: DesignSystem.labelStyle(
                buildContext: context,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: () => _startAssessment(),
              style: ElevatedButton.styleFrom(
                backgroundColor: DesignSystem.primary(context),
                padding: const EdgeInsets.symmetric(
                  horizontal: 32,
                  vertical: 16,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              child: Text(
                "START ASSESSMENT",
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).brightness == Brightness.dark
                      ? Colors.black
                      : Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHubContent(BuildContext context, FormattedLearningPath path) {
    final sectionData = path.skills[_selectedTab.toLowerCase()];

    final videos = sectionData?.videos ?? [];
    final missions = sectionData?.missions ?? [];

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 20),
          _buildHeader(context),
          const SizedBox(height: 30),
          _buildSkillOverview(context, path),
          const SizedBox(height: 35),
          _buildModuleSelector(context),
          const SizedBox(height: 30),
          if (missions.isEmpty && videos.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(40),
                child: Text(
                  "No missions available for this skill.",
                  style: DesignSystem.labelStyle(buildContext: context),
                ),
              ),
            ),
          if (path.proficiencyLevel.toLowerCase() == 'easy') ...[
            if (_selectedTab.toLowerCase() == 'reading')
              _InteractivePathfinderTip(
                tip: "You missed a few vocabulary questions in your assessment. This phase will help you master word-matching secrets!",
                icon: LucideIcons.sparkles,
                color: DesignSystem.easyPhaseGradient.colors.first,
                previewText: "Master word-matching secrets...",
              ),
            if (_selectedTab.toLowerCase() == 'listening')
              _InteractivePathfinderTip(
                tip: "You missed a few detail-oriented audio cues. This phase will sharpen your ear for precision and distractors!",
                icon: LucideIcons.headphones,
                color: DesignSystem.easyPhaseGradient.colors.first,
                previewText: "Sharpen your ear for precision...",
              ),
            if (_selectedTab.toLowerCase() == 'writing')
              _InteractivePathfinderTip(
                tip: "Your grammar and sentence structures need a solid foundation. Let's build your writing engine step-by-step!",
                icon: LucideIcons.penTool,
                color: DesignSystem.easyPhaseGradient.colors.first,
                previewText: "Build your writing engine...",
              ),
            if (_selectedTab.toLowerCase() == 'speaking')
              _InteractivePathfinderTip(
                tip: "Let's build your speaking confidence from safe topics to full interactions. Prepare for the final AI mock interview!",
                icon: LucideIcons.mic,
                color: DesignSystem.easyPhaseGradient.colors.first,
                previewText: "Build speaking confidence...",
              ),
          ] else if (path.proficiencyLevel.toLowerCase() == 'medium') ...[
            if (_selectedTab.toLowerCase() == 'reading')
              _InteractivePathfinderTip(
                tip: "You're reading well, but complex logic traps like TFNG are slowing you down. Let's master advanced inference.",
                icon: LucideIcons.sparkles,
                color: DesignSystem.mediumPhaseGradient.colors.first,
                previewText: "Master advanced inference...",
              ),
            if (_selectedTab.toLowerCase() == 'listening')
              _InteractivePathfinderTip(
                tip: "Multi-speaker flows and fast lectures are tricky. Time to practice spatial navigation and note-taking.",
                icon: LucideIcons.headphones,
                color: DesignSystem.mediumPhaseGradient.colors.first,
                previewText: "Practice note-taking...",
              ),
            if (_selectedTab.toLowerCase() == 'writing')
              _InteractivePathfinderTip(
                tip: "Your coherence is improving, but try using more advanced cohesive devices to link these academic points.",
                icon: LucideIcons.penTool,
                color: DesignSystem.mediumPhaseGradient.colors.first,
                previewText: "Use cohesive devices...",
              ),
            if (_selectedTab.toLowerCase() == 'speaking')
              _InteractivePathfinderTip(
                tip: "Your fluency is good, but you need to transition from safe topics to abstract reasoning and conditionals for a Band 7+.",
                icon: LucideIcons.mic,
                color: DesignSystem.mediumPhaseGradient.colors.first,
                previewText: "Transition to abstract reasoning...",
              ),
          ] else if (path.proficiencyLevel.toLowerCase() == 'hard') ...[
            if (_selectedTab.toLowerCase() == 'reading')
              _InteractivePathfinderTip(
                tip: "Your comprehension is excellent, but abstract meaning and speed are the final hurdles. Let's master rapid inference.",
                icon: LucideIcons.sparkles,
                color: DesignSystem.hardPhaseGradient.colors.first,
                previewText: "Master rapid inference...",
              ),
            if (_selectedTab.toLowerCase() == 'listening')
              _InteractivePathfinderTip(
                tip: "Your ear is sharp. Now we introduce high-speed synthesis and complex global accents. Focus on subtle distractors.",
                icon: LucideIcons.headphones,
                color: DesignSystem.hardPhaseGradient.colors.first,
                previewText: "Focus on subtle distractors...",
              ),
            if (_selectedTab.toLowerCase() == 'writing')
              _InteractivePathfinderTip(
                tip: "Your grammar is perfect, but stylistic choices matter. Try using a more active structure to sound authoritative.",
                icon: LucideIcons.penTool,
                color: DesignSystem.hardPhaseGradient.colors.first,
                previewText: "Refine stylistic choices...",
              ),
            if (_selectedTab.toLowerCase() == 'speaking')
              _InteractivePathfinderTip(
                tip: "It's time for the panel pressure. Focus on idiomatic naturalness and deep abstract reasoning.",
                icon: LucideIcons.mic,
                color: DesignSystem.hardPhaseGradient.colors.first,
                previewText: "Focus on idiomatic naturalness...",
              ),
          ],
          ...(missions.isNotEmpty ? missions : videos).asMap().entries.expand((entry) {
            int index = entry.key;
            var item = entry.value;
            
            bool isLocked;
            bool isFullyCompleted;
            
            if (item is Mission) {
              isLocked = index > 0 && !(missions[index - 1].isCompleted);
              isFullyCompleted = item.isCompleted;
            } else {
              isLocked = index > 0 && !(videos[index - 1].isCompleted);
              bool isPracticeCompleted = false;
              final skillKey = _selectedTab.toLowerCase();
              final learningMode = path.learningMode;
              if (learningMode is Map) {
                final skillLm = learningMode[skillKey];
                List<dynamic> questions = [];
                if (skillLm is List) {
                  questions = skillLm;
                } else if (skillLm is Map && skillLm['questions'] is List) {
                  questions = skillLm['questions'];
                }
                for (var q in questions) {
                   if (q is Map && (q['isCompleted'] == true || q['is_completed'] == true)) {
                     isPracticeCompleted = true;
                     break;
                   }
                }
              }
              
              final section = path.skills[skillKey];
              isFullyCompleted = (item as PathVideo).isCompleted && 
                  (section?.isNoteCompleted ?? false) && 
                  isPracticeCompleted;
            }
            
            MissionStatus status = isLocked ? MissionStatus.locked : (isFullyCompleted ? MissionStatus.completed : MissionStatus.active);

            String missionTitle = item is Mission ? item.title : "Module 0${index + 1}";
            String missionPhase = item is Mission ? "PHASE ${index + 1}" : "MASTERY PHASE ${index + 1}";

            final animation = CurvedAnimation(
              parent: _staggerController,
              curve: Interval(
                (index * 0.1).clamp(0.0, 1.0),
                ((index * 0.1) + 0.5).clamp(0.0, 1.0),
                curve: Curves.easeOutBack,
              ),
            );

            return [
              if (index > 0)
                Center(
                  child: Container(
                    width: 3,
                    height: 40,
                    margin: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: isLocked ? DesignSystem.primary(context).withValues(alpha: 0.2) : DesignSystem.emerald.withValues(alpha: 0.6),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
              AnimatedBuilder(
                animation: animation,
                builder: (context, child) {
                  return Transform.scale(
                    scale: 0.8 + (animation.value * 0.2),
                    child: Opacity(
                      opacity: animation.value,
                      child: child,
                    ),
                  );
                },
                child: _buildMissionCard(
                  context,
                  video: item is Mission ? _getMissionVideo(item, path) : item as PathVideo,
                  missionNumber: "${index + 1}",
                  title: missionTitle,
                  phase: missionPhase,
                  status: status,
                  path: path,
                  mission: item is Mission ? item : null,
                  unlockCondition: isLocked ? "Finish previous mission to unlock" : null,
                  onTap: status != MissionStatus.locked
                      ? () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => MissionDetailScreen(
                                video: item is Mission ? _getMissionVideo(item, path) : item as PathVideo,
                                index: index,
                                phase: missionPhase,
                                section: _selectedTab,
                                sectionData: sectionData ?? SkillPathSection(videos: [], pdfs: [], notes: '', isNoteCompleted: false, missions: []),
                                learningMode: path.learningMode,
                                mission: item is Mission ? item : null,
                              ),
                            ),
                          );
                        }
                      : null,
                ),
              )
            ];
          }).toList(),
          const SizedBox(height: 40),
          _buildUltimateGoalButton(context, path),
          const SizedBox(height: 120),
        ],
      ),
    );
  }

  Widget _buildUltimateGoalButton(BuildContext context, FormattedLearningPath path) {
    // Check if ALL skills are at 100%
    final r = _calculateSkillProgress(path, "reading");
    final l = _calculateSkillProgress(path, "listening");
    final w = _calculateSkillProgress(path, "writing");
    final s = _calculateSkillProgress(path, "speaking");
    
    final isCompleted = r >= 0.99 && l >= 0.99 && w >= 0.99 && s >= 0.99;
    
    return Container(
      width: double.infinity,
      height: 220,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: (isCompleted ? DesignSystem.emerald : Colors.amber).withValues(alpha: 0.3),
            blurRadius: 30,
            offset: const Offset(0, 15),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(32),
        child: Stack(
          children: [
            // Background Image (Adventure Banner)
            Positioned.fill(
              child: Image.file(
                File("C:\\Users\\hp\\.gemini\\antigravity\\brain\\3d9cdb31-2c9e-4646-b2a1-ce007a9bfd5a\\ultimate_mastery_adventure_banner_1776986514992.png"),
                fit: BoxFit.cover,
                errorBuilder: (context, error, stack) => Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                ),
              ),
            ),
            
            // Golden Overlay
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Colors.black.withValues(alpha: 0.7),
                      (isCompleted ? DesignSystem.emerald : Colors.amber).withValues(alpha: 0.4),
                    ],
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                  ),
                ),
              ),
            ),
            
            // Content
            Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: isCompleted ? DesignSystem.emerald : Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(100),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          isCompleted ? LucideIcons.unlock : LucideIcons.lock,
                          size: 14,
                          color: Colors.white,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          isCompleted ? "ULTIMATE GOAL UNLOCKED" : "THE FINAL CHALLENGE",
                          style: GoogleFonts.plusJakartaSans(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    "Full Mastery Mock Exam",
                    style: DesignSystem.headingStyle(
                      buildContext: context,
                      fontSize: 24,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    isCompleted 
                      ? "You have mastered all skills. Step into the arena and claim your certification."
                      : "Complete all missions and achieve 100% mastery to unlock your final exam.",
                    style: GoogleFonts.plusJakartaSans(
                      color: Colors.white.withValues(alpha: 0.8),
                      fontSize: 13,
                      height: 1.5,
                    ),
                  ),
                  if (isCompleted) ...[
                    const SizedBox(height: 20),
                    PrimaryButton(
                      text: "START MOCK EXAM",
                      onPressed: () {
                         // TODO: Navigate to final exam screen
                         _startAssessment(force: true);
                      },
                    ),
                  ],
                ],
              ),
            ),
            
            // Lock icon if not completed
            if (!isCompleted)
              Positioned(
                top: 24,
                right: 24,
                child: ClipOval(
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.4),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        LucideIcons.lock,
                        color: Colors.white70,
                        size: 24,
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          "Mastery Hub",
          style: DesignSystem.headingStyle(buildContext: context, fontSize: 24),
        ),
        IconButton(
          onPressed: () => _retakeAssessment(context),
          icon: Icon(LucideIcons.refreshCcw, size: 20, color: DesignSystem.labelText(context).withValues(alpha: 0.5)),
          tooltip: "Retake Assessment",
        ),
      ],
    );
  }

  void _retakeAssessment(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: DesignSystem.surface(context),
        title: Text(
          "Retake Assessment?",
          style: DesignSystem.headingStyle(buildContext: context, fontSize: 18),
        ),
        content: Text(
          "This will reset your current learning path and all progress. Are you sure you want to start over?",
          style: DesignSystem.labelStyle(buildContext: context, fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text("CANCEL", style: TextStyle(color: DesignSystem.labelText(context))),
          ),
          TextButton(
            onPressed: () async {
              try {
                // 1. Reset backend assessment and path
                await ref.read(assessmentApiServiceProvider).reset();
                
                // 2. Refresh local path state to empty
                ref.invalidate(learningPathProvider);
                
                if (context.mounted) {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const DiagnosticAssessmentScreen(force: true),
                    ),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text("Error resetting assessment: $e")),
                  );
                }
              }
            },
            child: const Text("RETAKE", style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  double _calculateSkillProgress(FormattedLearningPath path, String skill) {
    final skillKey = skill.toLowerCase();
    final section = path.skills[skillKey];
    if (section == null) return 0.0;
    
    final missions = section.missions;
    if (missions.isEmpty) return 0.0;

    double totalWeightedProgress = 0.0;

    // Determine practice completion for the entire skill
    final lm = path.learningMode;
    if (lm is Map) {
      final skillLm = lm[skillKey];
      List<dynamic> questions = [];
      if (skillLm is List) {
        questions = skillLm;
      } else if (skillLm is Map && skillLm['questions'] is List) {
        questions = skillLm['questions'] as List;
      }
      
      // For Writing/Speaking, the 'prompt' itself is the practice item.
      int totalQs = 0;
      int doneQs = 0;

      if (questions.isNotEmpty) {
        totalQs = questions.length;
        doneQs = questions.where((q) => q is Map && (q['isCompleted'] == true || q['is_completed'] == true)).length;
      } else if (skillLm is Map && (skillLm.containsKey('prompt') || skillLm.containsKey('question'))) {
        // Single prompt case (Writing/Speaking)
        totalQs = 1;
        doneQs = (skillLm['isCompleted'] == true || skillLm['is_completed'] == true) ? 1 : 0;
      }
      
      double practiceRatio = totalQs > 0 ? doneQs / totalQs : 0.0;
      
      for (int i = 0; i < missions.length; i++) {
        final mission = missions[i];
        
        // --- Weighted Mission Calculation ---
        // Video: 40% | PDF: 20% | Practice: 40%
        
        // 1. Video Progress (40 points)
        double videoScore = 0.0;
        if (mission.videos.isNotEmpty) {
          int completed = mission.videos.where((v) => v.isCompleted).length;
          videoScore = (completed / mission.videos.length) * 0.4;
        } else {
          // If no videos, re-distribute 40% to Practice
          videoScore = 0.0;
        }

        // 2. PDF Progress (20 points)
        double pdfScore = 0.0;
        if (mission.pdfs.isNotEmpty) {
          int completed = mission.pdfs.where((p) => p.isCompleted).length;
          pdfScore = (completed / mission.pdfs.length) * 0.2;
        } else {
          // If no PDFs, re-distribute 20% to Video or Practice
          pdfScore = 0.0;
        }

        // 3. Practice Progress (40 points)
        // Since practice is skill-wide, we distribute it across missions.
        // Or simply: each mission counts its 'share' of practice.
        // A simpler way: if the student has done some practice, they get points.
        // Let's use the overall practiceRatio for each mission's practice component.
        double practiceScore = practiceRatio * 0.4;

        // Total Mission Progress (0.0 to 1.0)
        double missionProgress = videoScore + pdfScore + practiceScore;
        
        // Each mission contributes 1/N to the total
        totalWeightedProgress += (missionProgress / missions.length);
      }
    } else {
      // Fallback if no learning mode (shouldn't happen)
      return section.videos.where((v) => v.isCompleted).length / (section.videos.length + 1);
    }
    
    return totalWeightedProgress.clamp(0.0, 1.0);
  }

  Widget _buildSkillOverview(BuildContext context, FormattedLearningPath path) {
    return GlassContainer(
      padding: const EdgeInsets.all(24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildMiniGauge(
            context,
            "READING",
            _calculateSkillProgress(path, "reading"),
            DesignSystem.primary(context),
          ),
          _buildMiniGauge(
            context,
            "LISTENING", 
            _calculateSkillProgress(path, "listening"), 
            Colors.blue
          ),
          _buildMiniGauge(
            context,
            "WRITING", 
            _calculateSkillProgress(path, "writing"), 
            const Color(0xFFF43F5E)
          ),
          _buildMiniGauge(
            context,
            "SPEAKING", 
            _calculateSkillProgress(path, "speaking"), 
            Colors.orange
          ),
        ],
      ),
    );
  }

  Widget _buildMiniGauge(
    BuildContext context,
    String label,
    double value,
    Color color,
  ) {
    return Column(
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            SizedBox(
              width: 55,
              height: 55,
              child: TweenAnimationBuilder<double>(
                tween: Tween<double>(begin: 0, end: value),
                duration: const Duration(milliseconds: 1500),
                curve: Curves.easeOutCubic,
                builder: (context, val, _) => CircularProgressIndicator(
                  value: val,
                  strokeWidth: 4,
                  backgroundColor: DesignSystem.surface(context),
                  valueColor: AlwaysStoppedAnimation(color),
                ),
              ),
            ),
            TweenAnimationBuilder<double>(
                tween: Tween<double>(begin: 0, end: value),
                duration: const Duration(milliseconds: 1500),
                builder: (context, val, _) => Text(
                  "${(val * 100).toInt()}%",
                  style: DesignSystem.headingStyle(
                    buildContext: context,
                    fontSize: 13,
                  ),
                ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Text(
          label,
          style: DesignSystem.labelStyle(buildContext: context, fontSize: 8),
        ),
      ],
    );
  }

  Widget _buildModuleSelector(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _buildTab(context, "Reading", _selectedTab == 'Reading'),
          _buildTab(context, "Listening", _selectedTab == 'Listening'),
          _buildTab(context, "Writing", _selectedTab == 'Writing'),
          _buildTab(context, "Speaking", _selectedTab == 'Speaking'),
        ],
      ),
    );
  }

  Widget _buildTab(BuildContext context, String label, bool active) {
    final primaryColor = DesignSystem.primary(context);
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedTab = label;
        });
      },
      child: Container(
        margin: const EdgeInsets.only(right: 12),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        decoration: BoxDecoration(
          color: active ? primaryColor : DesignSystem.surface(context),
          borderRadius: BorderRadius.circular(15),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            color: active
                ? (Theme.of(context).brightness == Brightness.dark
                      ? Colors.black
                      : Colors.white)
                : DesignSystem.labelText(context),
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
      ),
    );
  }

  Widget _buildMissionCard(
    BuildContext context, {
    required PathVideo video,
    required String missionNumber,
    required String title,
    required String phase,
    required MissionStatus status,
    required FormattedLearningPath path,
    String? unlockCondition,
    VoidCallback? onTap,
    Mission? mission,
  }) {
    bool isLocked = status == MissionStatus.locked;
    bool isActive = status == MissionStatus.active;
    bool isCompleted = status == MissionStatus.completed;
    final primaryColor = DesignSystem.primary(context);
    Color appearanceColor;
    if (path.proficiencyLevel.toLowerCase() == 'easy') {
      appearanceColor = DesignSystem.easyPhaseGradient.colors.first;
    } else if (path.proficiencyLevel.toLowerCase() == 'medium') {
      appearanceColor = DesignSystem.mediumPhaseGradient.colors.first;
    } else if (path.proficiencyLevel.toLowerCase() == 'hard') {
      appearanceColor = DesignSystem.hardPhaseGradient.colors.first;
    } else {
      appearanceColor = const Color(0xFF10B981); // Emerald fallback
    }
    final cardColor = isActive ? appearanceColor : primaryColor;

    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: GestureDetector(
        onTap: isLocked ? null : onTap,
        child: Opacity(
          opacity: isLocked ? 0.85 : 1,
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              boxShadow: isActive ? [
                BoxShadow(
                  color: appearanceColor.withValues(alpha: 0.3),
                  blurRadius: 30,
                  spreadRadius: 2,
                )
              ] : [],
            ),
            child: GlassContainer(
              padding: const EdgeInsets.all(0),
              borderColor: isActive ? appearanceColor.withValues(alpha: 0.5) : null,
              child: Column(
                children: [
                if (isActive)
                  Align(
                    alignment: Alignment.topRight,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [appearanceColor, appearanceColor.withValues(alpha: 0.8)],
                        ),
                        borderRadius: const BorderRadius.only(
                          bottomLeft: Radius.circular(15),
                        ),
                      ),
                      child: Text(
                        "ACTIVE",
                        style: DesignSystem.labelStyle(
                          buildContext: context,
                          fontSize: 9,
                          fontWeight: FontWeight.w900,
                          color: Theme.of(context).brightness == Brightness.dark
                              ? Colors.black
                              : Colors.white,
                        ),
                      ),
                    ),
                  ),
                if (isCompleted)
                  Align(
                    alignment: Alignment.topRight,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [appearanceColor, appearanceColor.withValues(alpha: 0.8)],
                        ),
                        borderRadius: const BorderRadius.only(
                          bottomLeft: Radius.circular(15),
                        ),
                      ),
                      child: Icon(
                        LucideIcons.check,
                        color: Theme.of(context).brightness == Brightness.dark
                            ? Colors.black
                            : Colors.white,
                        size: 12,
                      ),
                    ),
                  ),
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Hero(
                            tag: 'mission-phase-${video.id}',
                            child: Material(
                              type: MaterialType.transparency,
                              child: Text(
                                phase,
                                style:
                                    DesignSystem.labelStyle(
                                      buildContext: context,
                                      fontSize: 10,
                                    ).copyWith(
                                      color: isLocked
                                          ? DesignSystem.labelText(
                                              context,
                                            ).withValues(alpha: 0.7)
                                          : cardColor,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: 1,
                                    ),
                              ),
                            ),
                          ),
                          if (isActive)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: appearanceColor.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(100),
                                border: Border.all(color: appearanceColor.withValues(alpha: 0.3)),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(LucideIcons.star, size: 10, color: appearanceColor),
                                  const SizedBox(width: 4),
                                  Text(
                                    "+150 XP",
                                    style: GoogleFonts.plusJakartaSans(
                                      color: appearanceColor,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 10,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Hero(
                              tag: 'mission-title-${video.id}',
                              child: Material(
                                type: MaterialType.transparency,
                                child: Text(
                                  "Mission $missionNumber: $title",
                                  style:
                                      DesignSystem.headingStyle(
                                        buildContext: context,
                                        fontSize: 20,
                                      ).copyWith(
                                        color: isLocked
                                            ? DesignSystem.mainText(
                                                context,
                                              ).withValues(alpha: 0.5)
                                            : null,
                                      ),
                                ),
                              ),
                            ),
                          ),
                          if (isLocked)
                            Icon(
                              LucideIcons.lock,
                              color: DesignSystem.labelText(
                                context,
                              ).withValues(alpha: 0.5),
                              size: 24,
                            ),
                          if (isCompleted)
                            Icon(
                              LucideIcons.checkCircle2,
                              color: appearanceColor,
                              size: 24,
                            ),
                        ],
                      ),
                      if (isLocked && unlockCondition != null) ...[
                        const SizedBox(height: 10),
                        Text(
                          unlockCondition,
                          style: DesignSystem.labelStyle(
                            buildContext: context,
                            fontSize: 11,
                          ),
                        ),
                      ],
                      if (isActive) ...[
                        const SizedBox(height: 25),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: onTap,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: appearanceColor,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              elevation: 4,
                              shadowColor: appearanceColor.withValues(alpha: 0.4),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(LucideIcons.playCircle, size: 20),
                                const SizedBox(width: 8),
                                Text("CONTINUE MISSION", style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 15)),
                              ],
                            ),
                          ),
                        ),
                      ],
                      if (!isLocked && !isActive) ...[
                        const SizedBox(height: 25),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            _buildResourceAction(
                              context,
                              LucideIcons.playCircle,
                              "VIDEO",
                              isActive ? appearanceColor : DesignSystem.primary(context),
                            ),
                            _buildResourceAction(
                              context,
                              LucideIcons.fileText,
                              "PDF",
                              isActive ? appearanceColor : DesignSystem.primary(context),
                            ),
                            _buildResourceAction(
                              context,
                              _selectedTab.toLowerCase() == 'speaking' ? LucideIcons.mic : 
                              (_selectedTab.toLowerCase() == 'writing' ? LucideIcons.penTool : LucideIcons.edit3),
                              "PRACTICE",
                              isActive ? appearanceColor : DesignSystem.primary(context),
                            ),
                            _buildResourceAction(
                              context,
                              LucideIcons.trophy,
                              "TEST",
                              isActive ? appearanceColor : DesignSystem.primary(context),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    ));
  }

  Widget _buildResourceAction(
    BuildContext context,
    IconData icon,
    String label,
    Color color,
  ) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: DesignSystem.surface(context),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: DesignSystem.labelStyle(buildContext: context, fontSize: 9),
        ),
      ],
    );
  }


  // --- PATHFINDER FLOATING BUBBLE ---
  Widget _buildPathfinderBubble(BuildContext context, FormattedLearningPath path) {
    final primaryColor = DesignSystem.primary(context);
    
    String insight = "You are ready for the Test in Mission 01!";
    final gap = path.competencyGapAnalysis;
    if (gap is Map) {
      insight = gap['proficiency_profile'] ?? gap.values.firstWhere((v) => v is String, orElse: () => insight);
    } else if (gap is String) {
      insight = gap;
    }

    return _InteractivePathfinderTip(
      tip: insight,
      icon: LucideIcons.sparkles,
      color: primaryColor,
      isCompact: true,
      previewText: insight,
    );
  }

  PathVideo _getMissionVideo(Mission mission, FormattedLearningPath path) {
    if (mission.videos.isNotEmpty) {
      return mission.videos.first;
    }
    // Fallback to a placeholder video if mission only has PDFs
    return PathVideo(
      id: mission.title.hashCode, // Semi-unique ID
      title: mission.title,
      description: mission.objective,
      videoLink: '',
      thumbnailLink: '',
      level: path.proficiencyLevel,
      type: _selectedTab,
      examType: path.examType,
      isCompleted: mission.isCompleted,
    );
  }

  Widget _buildBlurCircle(Color color, double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
      ),
    );
  }
}

class _InteractivePathfinderTip extends StatefulWidget {
  final String tip;
  final IconData icon;
  final Color color;
  final bool isCompact;
  final String? previewText;

  const _InteractivePathfinderTip({
    required this.tip,
    required this.icon,
    required this.color,
    this.isCompact = false,
    this.previewText,
  });

  @override
  State<_InteractivePathfinderTip> createState() => _InteractivePathfinderTipState();
}

class _InteractivePathfinderTipState extends State<_InteractivePathfinderTip> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: widget.isCompact 
          ? const EdgeInsets.fromLTRB(16, 0, 16, 16) 
          : const EdgeInsets.fromLTRB(20, 0, 20, 20),
      child: Align(
        alignment: Alignment.bottomLeft,
        child: GestureDetector(
          onTap: () => setState(() => _isExpanded = !_isExpanded),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 400),
            curve: Curves.fastOutSlowIn,
            padding: EdgeInsets.all(_isExpanded ? 16 : (widget.isCompact ? 8 : 12)),
            constraints: BoxConstraints(
              maxWidth: MediaQuery.of(context).size.width * 0.85,
            ),
            decoration: BoxDecoration(
              color: _isExpanded 
                  ? (Theme.of(context).brightness == Brightness.dark 
                      ? const Color(0xFF1E293B) 
                      : Colors.white)
                  : widget.color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(_isExpanded ? 24 : (widget.isCompact ? 12 : 20)),
              border: Border.all(
                color: _isExpanded ? widget.color.withValues(alpha: 0.5) : widget.color.withValues(alpha: 0.3),
                width: _isExpanded ? 1.5 : 1,
              ),
              boxShadow: _isExpanded ? [
                BoxShadow(
                  color: Colors.black.withValues(alpha: _isExpanded ? 0.3 : 0.0),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                )
              ] : [],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: widget.color.withValues(alpha: 0.2),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(widget.icon, color: widget.color, size: 16),
                    ),
                    if (!_isExpanded && !widget.isCompact) ...[
                      const SizedBox(width: 10),
                      Text(
                        widget.previewText != null 
                            ? (widget.previewText!.length > 25 ? "${widget.previewText!.substring(0, 25)}..." : widget.previewText!)
                            : "Pathfinder Insights ✨",
                        style: GoogleFonts.plusJakartaSans(
                          color: widget.color,
                          fontWeight: FontWeight.w800,
                          fontSize: 12,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Icon(LucideIcons.chevronDown, color: widget.color.withValues(alpha: 0.5), size: 14),
                    ] else if (_isExpanded) ...[
                      const SizedBox(width: 10),
                      Text(
                        "Pathfinder Tip",
                        style: GoogleFonts.plusJakartaSans(
                          color: widget.color,
                          fontWeight: FontWeight.w800,
                          fontSize: 12,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ],
                ),
                if (_isExpanded) ...[
                  const SizedBox(height: 12),
                  Text(
                    widget.tip,
                    style: DesignSystem.bodyStyle(buildContext: context, fontSize: widget.isCompact ? 12 : 13)
                        .copyWith(
                          height: 1.5,
                          color: Theme.of(context).brightness == Brightness.dark 
                              ? Colors.white.withValues(alpha: 0.9) 
                              : Colors.black87,
                        ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
