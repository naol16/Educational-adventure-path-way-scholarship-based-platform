import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/counselor/providers/counselor_providers.dart';
import 'package:mobile/features/counselor/models/counselor_models.dart';
import 'package:mobile/features/counselor/screens/student_progress_detail_screen.dart';

class CounselorStudentsScreen extends ConsumerStatefulWidget {
  const CounselorStudentsScreen({super.key});

  @override
  ConsumerState<CounselorStudentsScreen> createState() => _CounselorStudentsScreenState();
}

class _CounselorStudentsScreenState extends ConsumerState<CounselorStudentsScreen> {
  String _search = '';

  @override
  Widget build(BuildContext context) {
    final studentsAsync = ref.watch(counselorStudentsProvider);

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(context),
            const SizedBox(height: 16),
            _buildSearchBar(context),
            const SizedBox(height: 16),
            Expanded(
              child: RefreshIndicator(
                onRefresh: () async => ref.invalidate(counselorStudentsProvider),
                color: DesignSystem.primary(context),
                child: studentsAsync.when(
                  data: (students) {
                    final filtered = students.where((s) => s.name.toLowerCase().contains(_search.toLowerCase())).toList();
                    if (filtered.isEmpty) return _buildEmpty(context);
                    return ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      itemCount: filtered.length,
                      itemBuilder: (ctx, i) => _buildStudentCard(context, filtered[i]),
                    );
                  },
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (e, _) => Center(child: Text('Error loading students', style: TextStyle(color: Colors.red))),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('My Students', style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 24, fontWeight: FontWeight.w800)),
                Text('Track their journey', style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 13)),
              ],
            ),
          ),
          Icon(LucideIcons.users, color: DesignSystem.primary(context), size: 24),
        ],
      ),
    );
  }

  Widget _buildSearchBar(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: GlassContainer(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        borderRadius: 18,
        child: Row(
          children: [
            Icon(LucideIcons.search, color: DesignSystem.labelText(context), size: 18),
            const SizedBox(width: 12),
            Expanded(
              child: TextField(
                onChanged: (v) => setState(() => _search = v),
                style: GoogleFonts.inter(color: DesignSystem.mainText(context), fontSize: 14),
                decoration: InputDecoration(
                  hintText: 'Search students…',
                  hintStyle: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 14),
                  border: InputBorder.none,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStudentCard(BuildContext context, StudentSummary student) {
    final primary = DesignSystem.primary(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GestureDetector(
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => StudentProgressDetailScreen(student: student))),
        child: GlassContainer(
          padding: const EdgeInsets.all(16),
          borderRadius: 22,
          child: Row(
            children: [
              CircleAvatar(
                radius: 26,
                backgroundColor: primary.withValues(alpha: 0.1),
                backgroundImage: student.avatarUrl != null ? NetworkImage(student.avatarUrl!) : null,
                child: student.avatarUrl == null
                    ? Text(student.name.substring(0, 1).toUpperCase(), style: GoogleFonts.plusJakartaSans(color: primary, fontWeight: FontWeight.w800, fontSize: 18))
                    : null,
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(student.name, style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontWeight: FontWeight.w700, fontSize: 15)),
                    if (student.fieldOfStudy != null)
                      Text(student.fieldOfStudy!, style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 12)),
                    if (student.targetCountry != null) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(LucideIcons.mapPin, color: DesignSystem.labelText(context), size: 11),
                          const SizedBox(width: 4),
                          Text(student.targetCountry!, style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 11)),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(color: primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                    child: Text('${student.sessionCount} sessions', style: GoogleFonts.inter(color: primary, fontSize: 10, fontWeight: FontWeight.w700)),
                  ),
                  const SizedBox(height: 6),
                  Icon(LucideIcons.chevronRight, color: DesignSystem.labelText(context), size: 16),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmpty(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.userX, color: DesignSystem.labelText(context), size: 56),
          const SizedBox(height: 16),
          Text('No students yet', style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 18, fontWeight: FontWeight.w700)),
          Text('Students will appear once they book sessions.', style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 13), textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
