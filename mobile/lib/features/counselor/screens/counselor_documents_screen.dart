import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/counselor/providers/counselor_providers.dart';
import 'package:mobile/features/counselor/models/counselor_models.dart';
import 'package:mobile/features/counselor/widgets/share_document_bottom_sheet.dart';

class CounselorDocumentsScreen extends ConsumerWidget {
  const CounselorDocumentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final docsAsync = ref.watch(counselorDocumentsProvider);
    final primary = DesignSystem.primary(context);

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openShareSheet(context, ref),
        backgroundColor: primary,
        icon: const Icon(LucideIcons.share2, color: Colors.black),
        label: Text('Share Doc', style: GoogleFonts.inter(color: Colors.black, fontWeight: FontWeight.w700)),
      ),
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(context),
            const SizedBox(height: 16),
            Expanded(
              child: RefreshIndicator(
                onRefresh: () async => ref.invalidate(counselorDocumentsProvider),
                color: primary,
                child: docsAsync.when(
                  data: (docs) {
                    if (docs.isEmpty) return _buildEmpty(context);
                    return ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      itemCount: docs.length,
                      itemBuilder: (ctx, i) => _buildDocCard(context, docs[i]),
                    );
                  },
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (e, _) => Center(child: Text('Error loading documents')),
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
                Text('Resource Hub', style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 24, fontWeight: FontWeight.w800)),
                Text('Documents shared with students', style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 13)),
              ],
            ),
          ),
          Icon(LucideIcons.files, color: DesignSystem.primary(context), size: 24),
        ],
      ),
    );
  }

  Widget _buildDocCard(BuildContext context, SharedDocument doc) {
    final primary = DesignSystem.primary(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GlassContainer(
        padding: const EdgeInsets.all(16),
        borderRadius: 22,
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(14)),
              child: Icon(LucideIcons.fileText, color: primary, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(doc.title, style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontWeight: FontWeight.w700, fontSize: 15)),
                  Text(DateFormat('MMM d, yyyy • h:mm a').format(doc.createdAt), style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 12)),
                  if (doc.sharedWith != null) ...[
                    const SizedBox(height: 4),
                    Text('Shared with: ${doc.sharedWith}', style: GoogleFonts.inter(color: primary, fontSize: 11, fontWeight: FontWeight.w600)),
                  ],
                ],
              ),
            ),
            if (doc.fileUrl != null)
              IconButton(
                icon: Icon(LucideIcons.externalLink, color: DesignSystem.labelText(context), size: 20),
                onPressed: () => launchUrl(Uri.parse(doc.fileUrl!)),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmpty(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.folderOpen, color: DesignSystem.labelText(context), size: 56),
          const SizedBox(height: 16),
          Text('No shared resources', style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 18, fontWeight: FontWeight.w700)),
          Text('Upload checklists, guides, or forms.', style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 13)),
        ],
      ),
    );
  }

  void _openShareSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ShareDocumentBottomSheet(onShared: () => ref.invalidate(counselorDocumentsProvider)),
    );
  }
}
