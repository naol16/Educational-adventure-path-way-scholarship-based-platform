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
  final _nameController = TextEditingController();
  final _idController = TextEditingController();
  bool _consent = false;

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
    final accent = state.primaryAccent;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 60),
            _buildHeader(),
            const SizedBox(height: 40),
            _buildTestTypeSelector(state, notifier, accent),
            const SizedBox(height: 24),
            _buildCandidateForm(accent),
            const SizedBox(height: 32),
            _buildRulesAccordion(accent),
            const SizedBox(height: 32),
            _buildConsentCheckbox(accent),
            const SizedBox(height: 40),
            _buildBeginButton(notifier, accent),
            const SizedBox(height: 60),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            IconButton(
              onPressed: () => ref.read(mockExamProvider.notifier).backToDashboard(),
              icon: const Icon(LucideIcons.arrowLeft, color: Colors.white, size: 20),
              style: IconButton.styleFrom(backgroundColor: Colors.white.withOpacity(0.05)),
            ),
            const SizedBox(width: 16),
            Text("Test Overview", style: DesignSystem.headingStyle(buildContext: context, fontSize: 24)),
          ],
        ),
        const SizedBox(height: 12),
        Text(
          "Verify your details and review the rules before beginning your assessment attempt.",
          style: GoogleFonts.inter(color: Colors.white54, fontSize: 14, height: 1.5),
        ),
      ],
    );
  }

  Widget _buildTestTypeSelector(MockExamState state, MockExamNotifier notifier, Color accent) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("SELECT TEST TYPE", style: DesignSystem.labelStyle(buildContext: context)),
        const SizedBox(height: 12),
        Row(
          children: [
            _TypeTab(
              label: "Academic",
              isSelected: state.testType == "Academic",
              onTap: () => notifier.setTestType("Academic"),
              accent: accent,
            ),
            const SizedBox(width: 12),
            _TypeTab(
              label: "General Training",
              isSelected: state.testType == "General",
              onTap: () => notifier.setTestType("General"),
              accent: accent,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildCandidateForm(Color accent) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("CANDIDATE DETAILS", style: DesignSystem.labelStyle(buildContext: context)),
        const SizedBox(height: 12),
        GlassContainer(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              _InputField(
                controller: _nameController,
                label: "Full Name",
                hint: "Enter your legal name",
                icon: LucideIcons.user,
                accent: accent,
              ),
              const SizedBox(height: 16),
              _InputField(
                controller: _idController,
                label: "Candidate ID",
                hint: "e.g. TOEFL-882901",
                icon: LucideIcons.contact,
                accent: accent,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRulesAccordion(Color accent) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("EXAM RULES", style: DesignSystem.labelStyle(buildContext: context)),
        const SizedBox(height: 12),
        _RuleTile(
          icon: LucideIcons.timer,
          title: "Continuous Attempt",
          desc: "The timer does not pause. Ensure you have enough uninterrupted time.",
          accent: accent,
        ),
        _RuleTile(
          icon: LucideIcons.shieldCheck,
          title: "Strict Navigation",
          desc: "In listening and integrated sections, navigation is locked until completion.",
          accent: accent,
        ),
        _RuleTile(
          icon: LucideIcons.mic,
          title: "Audio Requirements",
          desc: "Ensure your microphone is calibrated for the AI analysis.",
          accent: accent,
        ),
        _RuleTile(
          icon: LucideIcons.save,
          title: "Auto-Save Enabled",
          desc: "Progress is saved every 30s. You can resume if the app closes unexpectedly.",
          accent: accent,
        ),
      ],
    );
  }

  Widget _buildConsentCheckbox(Color accent) {
    return InkWell(
      onTap: () => setState(() => _consent = !_consent),
      child: Row(
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: _consent ? accent : Colors.white24),
              color: _consent ? accent : Colors.transparent,
            ),
            child: _consent ? const Icon(Icons.check, size: 16, color: Colors.black) : null,
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Text(
              "I am ready for the attempt and agree to the rules.",
              style: TextStyle(color: Colors.white70, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBeginButton(MockExamNotifier notifier, Color accent) {
    final isValid = _nameController.text.isNotEmpty && _idController.text.isNotEmpty && _consent;

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: isValid ? () {
          notifier.updateAnswer('candidateName', _nameController.text);
          notifier.updateAnswer('candidateID', _idController.text);
          notifier.startExam();
        } : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: accent,
          foregroundColor: Colors.black,
          disabledBackgroundColor: Colors.white.withOpacity(0.05),
          disabledForegroundColor: Colors.white24,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          padding: const EdgeInsets.symmetric(vertical: 20),
        ),
        child: Text("BEGIN FULL ASSESSMENT", style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800, fontSize: 15)),
      ),
    );
  }
}

class _TypeTab extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;
  final Color accent;

  const _TypeTab({required this.label, required this.isSelected, required this.onTap, required this.accent});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: isSelected ? accent : Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: isSelected ? accent : Colors.white10),
          ),
          child: Center(
            child: Text(
              label,
              style: GoogleFonts.plusJakartaSans(
                color: isSelected ? Colors.black : Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _InputField extends StatelessWidget {
  final TextEditingController controller;
  final String label, hint;
  final IconData icon;
  final Color accent;

  const _InputField({required this.controller, required this.label, required this.hint, required this.icon, required this.accent});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label.toUpperCase(), style: GoogleFonts.plusJakartaSans(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
          decoration: InputDecoration(
            prefixIcon: Icon(icon, color: accent, size: 18),
            hintText: hint,
            hintStyle: const TextStyle(color: Colors.white24),
            border: InputBorder.none,
            contentPadding: const EdgeInsets.symmetric(vertical: 12),
          ),
        ),
      ],
    );
  }
}

class _RuleTile extends StatelessWidget {
  final IconData icon;
  final String title, desc;
  final Color accent;

  const _RuleTile({required this.icon, required this.title, required this.desc, required this.accent});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GlassContainer(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: accent, size: 20),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: GoogleFonts.plusJakartaSans(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 4),
                  Text(desc, style: GoogleFonts.inter(color: Colors.white54, fontSize: 12, height: 1.4)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
