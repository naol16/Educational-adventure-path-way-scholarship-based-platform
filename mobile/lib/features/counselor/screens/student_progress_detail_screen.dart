import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/counselor/providers/counselor_providers.dart';
import 'package:mobile/features/counselor/models/counselor_models.dart';

class StudentProgressDetailScreen extends ConsumerWidget {
  final StudentSummary student;
  const StudentProgressDetailScreen({super.key, required this.student});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final progressAsync = ref.watch(studentProgressProvider(student.id));
    final primary = DesignSystem.primary(context);

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: Stack(
        children: [
          Positioned(top: -50, right: -50, child: DesignSystem.buildBlurCircle(primary.withValues(alpha: 0.05), 200)),
          CustomScrollView(
            slivers: [
              SliverAppBar(
                pinned: true,
                expandedHeight: 240,
                backgroundColor: DesignSystem.themeBackground(context),
                leading: IconButton(
                  icon: Icon(LucideIcons.chevronLeft, color: DesignSystem.mainText(context)),
                  onPressed: () => Navigator.pop(context),
                ),
                flexibleSpace: FlexibleSpaceBar(
                  background: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [primary.withValues(alpha: 0.12), DesignSystem.themeBackground(context)],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        CircleAvatar(
                          radius: 40,
                          backgroundColor: primary.withValues(alpha: 0.15),
                          backgroundImage: student.avatarUrl != null ? NetworkImage(student.avatarUrl!) : null,
                          child: student.avatarUrl == null
                              ? Text(student.name.substring(0, 1).toUpperCase(), style: GoogleFonts.plusJakartaSans(color: primary, fontWeight: FontWeight.w800, fontSize: 28))
                              : null,
                        ),
                        const SizedBox(height: 12),
                        Text(student.name, style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 22, fontWeight: FontWeight.w800)),
                        Text(student.email, style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 13)),
                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildIdentityHub(context),
                      const SizedBox(height: 32),
                      progressAsync.when(
                        data: (progress) => _buildConsultationHistory(context, progress),
                        loading: () => const Center(child: Padding(padding: EdgeInsets.all(40), child: CircularProgressIndicator())),
                        error: (e, _) => Center(child: Text('Failed to load consultation history', style: TextStyle(color: Colors.red))),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildIdentityHub(BuildContext context) {
    final primary = DesignSystem.primary(context);
    final labelColor = DesignSystem.labelText(context);
    final valueColor = DesignSystem.mainText(context);

    bool isMastersOrPhD = student.currentDegree?.toLowerCase().contains('master') == true || 
                          student.currentDegree?.toLowerCase().contains('phd') == true ||
                          student.fieldOfStudy?.toLowerCase().contains('graduate') == true;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("ACADEMIC IDENTITY", style: DesignSystem.labelStyle(buildContext: context)),
        const SizedBox(height: 16),
        GlassContainer(
          padding: const EdgeInsets.all(20),
          borderRadius: 24,
          child: Column(
            children: [
              _infoRow(context, LucideIcons.graduationCap, "Current Degree", student.currentDegree ?? "Not specified"),
              _divider(),
              _infoRow(context, LucideIcons.bookOpen, "Field of Study", student.fieldOfStudy ?? "Not specified"),
              _divider(),
              _infoRow(context, LucideIcons.award, "Proficiency Score", student.proficiencyScore ?? "Pending/None"),
              _divider(),
              if (isMastersOrPhD) ...[
                _infoRow(context, LucideIcons.microscope, "Research Area", student.researchArea ?? "To be defined"),
                _divider(),
              ],
              _infoRow(context, LucideIcons.banknote, "Desired Funding", student.desiredFunding ?? "Open to all"),
              _divider(),
              _infoRow(context, LucideIcons.mapPin, "Target Country", student.targetCountry ?? "International"),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildConsultationHistory(BuildContext context, Map<String, dynamic>? progress) {
    final sessions = (progress?['sessions'] as List?) ?? [];
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text("CONSULTATION HISTORY", style: DesignSystem.labelStyle(buildContext: context)),
            Text("${sessions.length} Sessions", style: GoogleFonts.inter(color: DesignSystem.primary(context), fontSize: 12, fontWeight: FontWeight.w700)),
          ],
        ),
        const SizedBox(height: 16),
        if (sessions.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 40),
              child: Column(
                children: [
                  Icon(LucideIcons.calendarX2, color: Colors.white10, size: 48),
                  const SizedBox(height: 12),
                  Text("No sessions recorded with you yet.", style: GoogleFonts.inter(color: Colors.white24, fontSize: 13)),
                ],
              ),
            ),
          )
        else
          ...sessions.map((s) => _sessionCard(context, s)).toList(),
      ],
    );
  }

  Widget _sessionCard(BuildContext context, dynamic session) {
    final primary = DesignSystem.primary(context);
    final date = session['date'] != null ? DateTime.tryParse(session['date']) : null;
    final status = session['status'] ?? 'completed';
    
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GlassContainer(
        padding: const EdgeInsets.all(16),
        borderRadius: 20,
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
              child: Icon(LucideIcons.video, color: primary, size: 20),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    date != null ? DateFormat('MMMM d, yyyy').format(date) : "Recent Session",
                    style: GoogleFonts.plusJakartaSans(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  Text(
                    session['topic'] ?? "General Counseling",
                    style: GoogleFonts.inter(color: Colors.white54, fontSize: 12),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: status == 'completed' ? const Color(0xFF10B981).withOpacity(0.1) : Colors.amber.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                status.toUpperCase(),
                style: GoogleFonts.inter(
                  color: status == 'completed' ? const Color(0xFF10B981) : Colors.amber,
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(BuildContext context, IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, color: DesignSystem.primary(context).withValues(alpha: 0.7), size: 18),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label.toUpperCase(), style: GoogleFonts.plusJakartaSans(color: DesignSystem.labelText(context), fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
                Text(value, style: GoogleFonts.inter(color: DesignSystem.mainText(context), fontSize: 14, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _divider() {
    return Divider(color: Colors.white.withOpacity(0.05), height: 24);
  }
}
