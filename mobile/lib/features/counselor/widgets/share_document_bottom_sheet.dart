import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:mobile/features/counselor/providers/counselor_providers.dart';
import 'package:mobile/features/counselor/models/counselor_models.dart';

class ShareDocumentBottomSheet extends ConsumerStatefulWidget {
  final VoidCallback onShared;
  const ShareDocumentBottomSheet({super.key, required this.onShared});

  @override
  ConsumerState<ShareDocumentBottomSheet> createState() => _ShareDocumentBottomSheetState();
}

class _ShareDocumentBottomSheetState extends ConsumerState<ShareDocumentBottomSheet> {
  final _titleController = TextEditingController();
  final _urlController = TextEditingController();
  int? _selectedStudentId;
  bool _isLoading = false;

  @override
  void dispose() {
    _titleController.dispose();
    _urlController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final studentsAsync = ref.watch(counselorStudentsProvider);
    final primary = DesignSystem.primary(context);

    return Container(
      padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      decoration: BoxDecoration(
        color: DesignSystem.overlayBackground(context),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Share Document', style: GoogleFonts.plusJakartaSans(fontSize: 20, fontWeight: FontWeight.w800, color: DesignSystem.mainText(context))),
              IconButton(icon: const Icon(LucideIcons.x), onPressed: () => Navigator.pop(context)),
            ],
          ),
          const SizedBox(height: 20),

          _buildLabel('Document Title'),
          _buildTextField(_titleController, 'e.g. Scholarship Checklist', icon: LucideIcons.type),
          const SizedBox(height: 20),

          _buildLabel('Document URL / Link'),
          _buildTextField(_urlController, 'https://drive.google.com/...', icon: LucideIcons.link),
          const SizedBox(height: 20),

          _buildLabel('Shared With (Optional)'),
          studentsAsync.when(
            data: (students) => _buildStudentDropdown(students),
            loading: () => const LinearProgressIndicator(),
            error: (_, __) => Text('Failed to load students'),
          ),
          const SizedBox(height: 32),

          PrimaryButton(
            text: _isLoading ? 'Sharing…' : 'Share Now',
            onPressed: _isLoading ? null : _submit,
            isLoading: _isLoading,
          ),
        ],
      ),
    );
  }

  Widget _buildLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, left: 4),
      child: Text(label, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: DesignSystem.labelText(context))),
    );
  }

  Widget _buildTextField(TextEditingController controller, String hint, {IconData? icon}) {
    return GlassContainer(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      borderRadius: 16,
      child: TextFormField(
        controller: controller,
        style: GoogleFonts.inter(color: DesignSystem.mainText(context), fontSize: 14),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: GoogleFonts.inter(color: DesignSystem.labelText(context)),
          icon: icon != null ? Icon(icon, size: 18, color: DesignSystem.labelText(context)) : null,
          border: InputBorder.none,
        ),
      ),
    );
  }

  Widget _buildStudentDropdown(List<StudentSummary> students) {
    return GlassContainer(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      borderRadius: 16,
      child: DropdownButtonHideUnderline(
        child: DropdownButton<int>(
          value: _selectedStudentId,
          isExpanded: true,
          hint: Text('Everyone (Public Hub)', style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 14)),
          items: [
            const DropdownMenuItem<int>(value: null, child: Text('Everyone (Public Hub)')),
            ...students.map((s) => DropdownMenuItem(value: s.id, child: Text(s.name))),
          ],
          onChanged: (v) => setState(() => _selectedStudentId = v),
          dropdownColor: DesignSystem.overlayBackground(context),
          style: GoogleFonts.inter(color: DesignSystem.mainText(context), fontSize: 14),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (_titleController.text.isEmpty || _urlController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all fields')));
      return;
    }

    setState(() => _isLoading = true);
    final ok = await ref.read(counselorAppServiceProvider).shareDocument(
      title: _titleController.text,
      url: _urlController.text,
      studentId: _selectedStudentId,
    );
    setState(() => _isLoading = false);

    if (mounted) {
      if (ok) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Document shared successfully!')));
        widget.onShared();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to share document.')));
      }
    }
  }
}
