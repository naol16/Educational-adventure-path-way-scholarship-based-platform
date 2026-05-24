import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/counselor/providers/counselor_providers.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';

class CounselorTasksScreen extends ConsumerStatefulWidget {
  const CounselorTasksScreen({super.key});

  @override
  ConsumerState<CounselorTasksScreen> createState() => _CounselorTasksScreenState();
}

class _CounselorTasksScreenState extends ConsumerState<CounselorTasksScreen> {
  bool _isAdding = false;
  final TextEditingController _taskController = TextEditingController();

  @override
  void dispose() {
    _taskController.dispose();
    super.dispose();
  }

  void _addTask() {
    if (_taskController.text.trim().isNotEmpty) {
      ref.read(counselorGoalsProvider.notifier).addGoal(_taskController.text);
      _taskController.clear();
      setState(() => _isAdding = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final goals = ref.watch(counselorGoalsProvider);
    final completedCount = goals.where((g) => g.isCompleted).length;
    final totalCount = goals.length;
    final completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0.0;
    
    final primary = DesignSystem.primary(context);

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: SafeArea(
        child: Stack(
          children: [
            Positioned(
              top: -100,
              right: -50,
              child: DesignSystem.buildBlurCircle(primary.withValues(alpha: 0.1), 300),
            ),
            Column(
              children: [
                _buildHeader(context, completionRate, completedCount, totalCount),
                Expanded(
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                    child: Column(
                      children: [
                        _buildInputArea(context),
                        const SizedBox(height: 32),
                        _buildTasksList(context, goals),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, double rate, int completed, int total) {
    final primary = DesignSystem.primary(context);
    
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 30),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: DesignSystem.surface(context).withValues(alpha: 0.1),
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              IconButton(
                icon: Icon(LucideIcons.arrowLeft, color: DesignSystem.mainText(context)),
                onPressed: () => Navigator.pop(context),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
              const SizedBox(width: 16),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: primary.withValues(alpha: 0.2)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(LucideIcons.zap, color: Colors.amber, size: 14),
                    const SizedBox(width: 6),
                    Text(
                      'PRODUCTIVITY DASHBOARD',
                      style: GoogleFonts.plusJakartaSans(
                        color: primary,
                        fontSize: 9,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            'Counselor Goals',
            style: GoogleFonts.plusJakartaSans(
              color: DesignSystem.mainText(context),
              fontSize: 32,
              fontWeight: FontWeight.w900,
              height: 1.1,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Track your progress and personal academic milestones for your students with a premium tactical overview.',
            style: GoogleFonts.inter(
              color: DesignSystem.labelText(context),
              fontSize: 14,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 24),
          
          // Progress Section
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'OVERALL PROGRESS',
                    style: GoogleFonts.plusJakartaSans(
                      color: DesignSystem.labelText(context),
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${rate.round()}%',
                    style: GoogleFonts.plusJakartaSans(
                      color: DesignSystem.mainText(context),
                      fontSize: 36,
                      fontWeight: FontWeight.w900,
                      height: 1,
                    ),
                  ),
                ],
              ),
              Icon(LucideIcons.trendingUp, color: Colors.green.withValues(alpha: 0.5), size: 36),
            ],
          ),
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Container(
              height: 8,
              width: double.infinity,
              color: DesignSystem.surface(context),
              child: FractionallySizedBox(
                alignment: Alignment.centerLeft,
                widthFactor: total > 0 ? (completed / total) : 0,
                child: Container(
                  decoration: BoxDecoration(
                    color: primary,
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '$completed of $total goals achieved',
            style: GoogleFonts.inter(
              color: DesignSystem.labelText(context),
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputArea(BuildContext context) {
    if (!_isAdding) {
      return Center(
        child: ElevatedButton(
          onPressed: () => setState(() => _isAdding = true),
          style: ElevatedButton.styleFrom(
            backgroundColor: DesignSystem.primary(context),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            elevation: 0,
          ),
          child: Text(
            'ADD GOAL',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 12,
              fontWeight: FontWeight.w900,
              letterSpacing: 1.5,
            ),
          ),
        ),
      );
    }

    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: _taskController,
            autofocus: true,
            style: GoogleFonts.inter(color: DesignSystem.mainText(context)),
            decoration: InputDecoration(
              hintText: 'Describe your goal...',
              hintStyle: GoogleFonts.inter(color: DesignSystem.labelText(context)),
              filled: true,
              fillColor: DesignSystem.surface(context),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide.none,
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
            ),
            onSubmitted: (_) => _addTask(),
          ),
        ),
        const SizedBox(width: 12),
        GestureDetector(
          onTap: _addTask,
          child: Container(
            height: 56,
            padding: const EdgeInsets.symmetric(horizontal: 24),
            decoration: BoxDecoration(
              color: DesignSystem.primary(context),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Center(
              child: Text(
                'ADD',
                style: GoogleFonts.plusJakartaSans(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  fontSize: 12,
                  letterSpacing: 1,
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),
        GestureDetector(
          onTap: () {
            setState(() => _isAdding = false);
            _taskController.clear();
          },
          child: Container(
            height: 56,
            width: 56,
            decoration: BoxDecoration(
              border: Border.all(color: DesignSystem.surface(context)),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(LucideIcons.x, color: DesignSystem.labelText(context)),
          ),
        ),
      ],
    );
  }

  Widget _buildTasksList(BuildContext context, List goals) {
    if (goals.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 40),
        child: GlassContainer(
          padding: const EdgeInsets.all(40),
          borderRadius: 24,
          child: Column(
            children: [
              Icon(LucideIcons.clipboardList, size: 64, color: DesignSystem.labelText(context).withValues(alpha: 0.2)),
              const SizedBox(height: 24),
              Text(
                'No Active Goals',
                style: GoogleFonts.plusJakartaSans(
                  color: DesignSystem.mainText(context),
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Start adding professional milestones to track your progress.',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  color: DesignSystem.labelText(context),
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      children: goals.map((goal) {
        final isCompleted = goal.isCompleted;
        return Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: Container(
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(
                  color: DesignSystem.surface(context).withValues(alpha: 0.5),
                ),
              ),
            ),
            padding: const EdgeInsets.only(bottom: 16),
            child: Row(
              children: [
                GestureDetector(
                  onTap: () => ref.read(counselorGoalsProvider.notifier).toggleGoal(goal.id),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: isCompleted ? Colors.green : Colors.transparent,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isCompleted ? Colors.green : DesignSystem.surface(context),
                        width: 2,
                      ),
                    ),
                    child: isCompleted
                        ? const Icon(LucideIcons.check, color: Colors.white, size: 20)
                        : null,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Text(
                    goal.text,
                    style: GoogleFonts.inter(
                      color: isCompleted
                          ? DesignSystem.labelText(context)
                          : DesignSystem.mainText(context),
                      fontSize: 16,
                      fontWeight: isCompleted ? FontWeight.w500 : FontWeight.w700,
                      decoration: isCompleted ? TextDecoration.lineThrough : null,
                    ),
                  ),
                ),
                IconButton(
                  icon: Icon(LucideIcons.trash2, color: Colors.red.withValues(alpha: 0.5)),
                  onPressed: () => ref.read(counselorGoalsProvider.notifier).removeGoal(goal.id),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}
