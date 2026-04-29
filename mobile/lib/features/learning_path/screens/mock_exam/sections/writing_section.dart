import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/learning_path/providers/mock_exam_provider.dart';

class WritingSectionWidget extends ConsumerStatefulWidget {
  const WritingSectionWidget({super.key});

  @override
  ConsumerState<WritingSectionWidget> createState() => _WritingSectionWidgetState();
}

class _WritingSectionWidgetState extends ConsumerState<WritingSectionWidget> {
  final _controller = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Restore any existing answer
    final existing = ref.read(mockExamProvider).answers['writing'] as String? ?? '';
    _controller.text = existing;
    _controller.addListener(() {
      ref.read(mockExamProvider.notifier).updateAnswer('writing', _controller.text);
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  int get _wordCount {
    final text = _controller.text.trim();
    if (text.isEmpty) return 0;
    return text.split(RegExp(r'\s+')).where((w) => w.isNotEmpty).length;
  }

  @override
  Widget build(BuildContext context) {
    final prompt = ref.watch(mockExamProvider.select((s) => s.blueprint?.sections.writing?.prompt ?? ''));
    final wc = _wordCount;
    final primary = DesignSystem.primary(context);
    final wcColor = wc < 50
        ? const Color(0xFFF87171)
        : wc >= 250
            ? primary
            : const Color(0xFFF59E0B);

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth > 700;

        final promptCard = GlassContainer(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(LucideIcons.edit3, size: 16, color: primary),
                  const SizedBox(width: 8),
                  Text('Writing Task',
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
                  style: DesignSystem.bodyStyle(buildContext: context, fontSize: 13, fontWeight: FontWeight.normal)
                      .copyWith(height: 1.6),
                ),
              ),
              const SizedBox(height: 10),
              Text('Write at least 250 words.',
                  style: DesignSystem.labelStyle(buildContext: context, fontSize: 11)
                      .copyWith(fontStyle: FontStyle.italic)),
            ],
          ),
        );

        final editorCard = GlassContainer(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Your Response',
                      style: DesignSystem.labelStyle(buildContext: context, fontSize: 12)
                          .copyWith(fontWeight: FontWeight.bold)),
                  AnimatedDefaultTextStyle(
                    duration: const Duration(milliseconds: 200),
                    style: GoogleFonts.inter(color: wcColor, fontWeight: FontWeight.bold, fontSize: 12),
                    child: Text('$wc words'),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              if (isWide)
                Expanded(
                  child: _buildTextField(context),
                )
              else
                SizedBox(height: 320, child: _buildTextField(context)),
            ],
          ),
        );

        if (isWide) {
          return Row(
            children: [
              Expanded(child: Padding(padding: const EdgeInsets.all(16), child: promptCard)),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(children: [Expanded(child: editorCard)]),
                ),
              ),
            ],
          );
        }

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              promptCard,
              const SizedBox(height: 16),
              editorCard,
            ],
          ),
        );
      },
    );
  }

  Widget _buildTextField(BuildContext context) {
    return TextField(
      controller: _controller,
      maxLines: null,
      expands: true,
      textAlignVertical: TextAlignVertical.top,
      style: GoogleFonts.inter(
        color: DesignSystem.mainText(context),
        fontSize: 14,
        height: 1.65,
      ),
      decoration: InputDecoration(
        hintText: 'Start writing here... (minimum 250 words recommended)',
        hintStyle: GoogleFonts.inter(
            color: DesignSystem.labelText(context).withValues(alpha: 0.4), fontSize: 13),
        border: InputBorder.none,
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
    );
  }
}
