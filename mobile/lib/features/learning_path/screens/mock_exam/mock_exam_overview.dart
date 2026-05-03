import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/learning_path/providers/mock_exam_provider.dart';

class MockExamOverview extends ConsumerStatefulWidget {
  const MockExamOverview({super.key});

  @override
  ConsumerState<MockExamOverview> createState() => _MockExamOverviewState();
}

class _MockExamOverviewState extends ConsumerState<MockExamOverview> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _idController = TextEditingController();
  bool _isConfirmed = false;

  @override
  void dispose() {
    _nameController.dispose();
    _idController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(mockExamProvider);
    final notifier = ref.read(mockExamProvider.notifier);
    final primary = DesignSystem.primary(context);

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: Stack(
        children: [
          Positioned(
            top: -80, right: -60,
            child: DesignSystem.buildBlurCircle(primary.withValues(alpha: 0.07), 280),
          ),
          SafeArea(
            child: Column(
              children: [
                _buildHeader(context, notifier),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSectionTitle(context, "Test overview"),
                        const SizedBox(height: 16),
                        _buildTestOverviewGrid(context),
                        const SizedBox(height: 32),
                        _buildSectionTitle(context, "Candidate details"),
                        const SizedBox(height: 16),
                        _buildCandidateFields(context),
                        const SizedBox(height: 32),
                        _buildSectionTitle(context, "Test rules"),
                        const SizedBox(height: 16),
                        _buildTestRules(context),
                        const SizedBox(height: 40),
                        _buildConfirmation(context),
                        const SizedBox(height: 24),
                        _buildStartButton(context, notifier),
                        const SizedBox(height: 40),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context, MockExamNotifier notifier) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          IconButton(
            onPressed: notifier.backToDashboard,
            icon: Icon(LucideIcons.arrowLeft, color: DesignSystem.mainText(context)),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Full Mastery IELTS Academic Mock Exam',
              style: DesignSystem.headingStyle(buildContext: context, fontSize: 18),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Text(
      title,
      style: DesignSystem.headingStyle(buildContext: context, fontSize: 16),
    );
  }

  Widget _buildTestOverviewGrid(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        _buildOverviewCard(context, LucideIcons.headphones, "Listening", "30 min", "4 sections", Colors.teal),
        _buildOverviewCard(context, LucideIcons.bookOpen, "Reading", "60 min", "3 passages", Colors.blue),
        _buildOverviewCard(context, LucideIcons.edit3, "Writing", "60 min", "Task 1 + Task 2", Colors.pink),
        _buildOverviewCard(context, LucideIcons.mic, "Speaking", "14 min", "3 parts", Colors.orange),
      ],
    );
  }

  Widget _buildOverviewCard(BuildContext context, IconData icon, String title, String time, String sub, Color color) {
    return GlassContainer(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 16),
              const SizedBox(width: 6),
              Text(title, style: DesignSystem.labelStyle(buildContext: context, fontSize: 13)),
            ],
          ),
          const Spacer(),
          Text(time, style: DesignSystem.headingStyle(buildContext: context, fontSize: 18)),
          Text(sub, style: DesignSystem.labelStyle(buildContext: context, fontSize: 11)),
        ],
      ),
    );
  }

  Widget _buildCandidateFields(BuildContext context) {
    return Column(
      children: [
        _buildTextField(context, "Full Name", _nameController, "e.g. John Doe"),
        const SizedBox(height: 16),
        _buildTextField(context, "Candidate ID", _idController, "e.g. 123456"),
      ],
    );
  }

  Widget _buildTextField(BuildContext context, String label, TextEditingController controller, String hint) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: DesignSystem.labelStyle(buildContext: context, fontSize: 12)),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: DesignSystem.inputFill(context),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: DesignSystem.glassBorder(context)),
          ),
          child: TextField(
            controller: controller,
            style: DesignSystem.bodyStyle(buildContext: context),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: DesignSystem.labelStyle(buildContext: context).copyWith(color: Colors.white24),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              border: InputBorder.none,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTestRules(BuildContext context) {
    final rules = [
      "Ensure a stable internet connection.",
      "No breaks are allowed once the test starts.",
      "AI evaluation will be provided within 3-5 minutes of completion.",
    ];

    return Column(
      children: rules.map((rule) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(LucideIcons.dot, size: 20, color: Colors.teal),
            const SizedBox(width: 4),
            Expanded(
              child: Text(
                rule,
                style: DesignSystem.bodyStyle(buildContext: context, fontSize: 13),
              ),
            ),
          ],
        ),
      )).toList(),
    );
  }

  Widget _buildConfirmation(BuildContext context) {
    return Row(
      children: [
        Checkbox(
          value: _isConfirmed,
          onChanged: (val) => setState(() => _isConfirmed = val ?? false),
          activeColor: Colors.teal,
          side: const BorderSide(color: Colors.white24),
        ),
        Expanded(
          child: Text(
            "I confirm that I am ready to begin the assessment.",
            style: DesignSystem.labelStyle(buildContext: context, fontSize: 12),
          ),
        ),
      ],
    );
  }

  Widget _buildStartButton(BuildContext context, MockExamNotifier notifier) {
    final primary = DesignSystem.primary(context);
    final canStart = _isConfirmed && _nameController.text.isNotEmpty && _idController.text.isNotEmpty;

    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: canStart ? () {
          notifier.updateAnswer('candidateName', _nameController.text);
          notifier.updateAnswer('candidateID', _idController.text);
          notifier.startExam();
        } : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: canStart ? Colors.teal : Colors.grey.withValues(alpha: 0.2),
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          elevation: 0,
        ),
        child: Text(
          'Begin Listening Section',
          style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 16),
        ),
      ),
    );
  }
}
