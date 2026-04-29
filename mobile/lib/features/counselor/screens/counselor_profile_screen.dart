import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/counselor/providers/counselor_providers.dart';
import 'package:mobile/features/counselor/models/counselor_models.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/counselor/screens/counselor_documents_screen.dart';
import 'package:mobile/features/counselor/screens/counselor_reviews_screen.dart';

class CounselorProfileScreen extends ConsumerWidget {
  const CounselorProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(counselorProfileProvider);
    final primary = DesignSystem.primary(context);

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      appBar: AppBar(
        title: Text('Profile', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800)),
        actions: [
          IconButton(icon: const Icon(LucideIcons.edit3), onPressed: () => _editProfile(context)),
        ],
      ),
      body: profileAsync.when(
        data: (profile) {
          if (profile == null) return const Center(child: Text('Profile not found'));
          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildAvatarSection(context, profile),
                const SizedBox(height: 32),
                _buildInfoSection(context, 'Core Identity', [
                  _infoTile(LucideIcons.user, 'Bio', profile.bio),
                  _infoTile(LucideIcons.phone, 'Phone', profile.phoneNumber ?? 'Not provided'),
                  _infoTile(LucideIcons.globe, 'Residence', '${profile.city ?? ''}, ${profile.countryOfResidence ?? ''}'),
                ]),
                const SizedBox(height: 24),
                _buildInfoSection(context, 'Resources & Feedback', [
                  _menuTile(context, LucideIcons.files, 'Shared Documents', 'Manage resources', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CounselorDocumentsScreen()))),
                  _menuTile(context, LucideIcons.star, 'Reviews & Ratings', 'See student feedback', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CounselorReviewsScreen()))),
                ]),
                const SizedBox(height: 24),
                _buildInfoSection(context, 'Professional', [
                  _infoTile(LucideIcons.graduationCap, 'Education', profile.highestEducationLevel ?? 'Not specified'),
                  _infoTile(LucideIcons.graduationCap, 'University', profile.universityName ?? 'Not specified'),
                  _infoTile(LucideIcons.briefcase, 'Position', profile.currentPosition ?? 'Not specified'),
                  _infoTile(LucideIcons.building, 'Organization', profile.organization ?? 'Not specified'),
                ]),
                const SizedBox(height: 24),
                _buildInfoSection(context, 'Expertise', [
                  _infoTile(LucideIcons.award, 'Areas', profile.areasOfExpertise.join(', ')),
                  _infoTile(LucideIcons.languages, 'Languages', profile.languages.join(', ')),
                ]),
                const SizedBox(height: 24),
                _buildInfoSection(context, 'Consultation', [
                  _infoTile(LucideIcons.coins, 'Hourly Rate', '${profile.hourlyRate.toInt()} ETB / hour'),
                  _infoTile(LucideIcons.clock, 'Duration', '${profile.sessionDuration} min'),
                  _infoTile(LucideIcons.video, 'Modes', profile.consultationModes.join(', ').toUpperCase()),
                ]),
                const SizedBox(height: 40),
                _buildLogoutButton(context, ref),
                const SizedBox(height: 100),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error loading profile')),
      ),
    );
  }

  Widget _buildAvatarSection(BuildContext context, CounselorProfile profile) {
    return Center(
      child: Column(
        children: [
          Stack(
            children: [
              CircleAvatar(
                radius: 60,
                backgroundColor: DesignSystem.primary(context).withValues(alpha: 0.1),
                backgroundImage: profile.profileImageUrl != null ? NetworkImage(profile.profileImageUrl!) : null,
                child: profile.profileImageUrl == null ? Icon(LucideIcons.user, size: 50, color: DesignSystem.primary(context)) : null,
              ),
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: DesignSystem.primary(context), shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 2)),
                  child: const Icon(LucideIcons.camera, color: Colors.white, size: 16),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(profile.name, style: GoogleFonts.plusJakartaSans(fontSize: 24, fontWeight: FontWeight.w800, color: DesignSystem.mainText(context))),
          Text(profile.email, style: GoogleFonts.inter(fontSize: 14, color: DesignSystem.labelText(context))),
          const SizedBox(height: 8),
          _buildVerificationBadge(context, profile.verificationStatus),
        ],
      ),
    );
  }

  Widget _buildVerificationBadge(BuildContext context, String status) {
    Color color;
    IconData icon;
    String label;
    switch (status) {
      case 'verified': color = const Color(0xFF10B981); icon = Icons.verified; label = 'Verified Expert'; break;
      case 'rejected': color = Colors.red; icon = LucideIcons.alertCircle; label = 'Rejected'; break;
      default: color = const Color(0xFFF59E0B); icon = LucideIcons.clock; label = 'Pending Approval';
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: color.withValues(alpha: 0.3))),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 14),
          const SizedBox(width: 6),
          Text(label, style: GoogleFonts.inter(color: color, fontSize: 11, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }

  Widget _buildInfoSection(BuildContext context, String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 12),
          child: Text(title, style: GoogleFonts.plusJakartaSans(fontSize: 16, fontWeight: FontWeight.w800, color: DesignSystem.mainText(context))),
        ),
        GlassContainer(
          padding: const EdgeInsets.all(8),
          borderRadius: 24,
          child: Column(children: children),
        ),
      ],
    );
  }

  Widget _infoTile(IconData icon, String label, String value) {
    return Builder(builder: (context) {
      return ListTile(
        leading: Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: DesignSystem.surface(context), borderRadius: BorderRadius.circular(10)), child: Icon(icon, size: 18, color: DesignSystem.primary(context))),
        title: Text(label, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: DesignSystem.labelText(context))),
        subtitle: Text(value, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: DesignSystem.mainText(context))),
      );
    });
  }

  Widget _menuTile(BuildContext context, IconData icon, String title, String subtitle, VoidCallback onTap) {
    return ListTile(
      onTap: onTap,
      leading: Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: DesignSystem.surface(context), borderRadius: BorderRadius.circular(10)), child: Icon(icon, size: 18, color: DesignSystem.primary(context))),
      title: Text(title, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: DesignSystem.mainText(context))),
      subtitle: Text(subtitle, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w500, color: DesignSystem.labelText(context))),
      trailing: Icon(LucideIcons.chevronRight, size: 18, color: DesignSystem.labelText(context)),
    );
  }

  Widget _buildLogoutButton(BuildContext context, WidgetRef ref) {
    return Center(
      child: TextButton.icon(
        onPressed: () => ref.read(authProvider.notifier).logout(),
        icon: const Icon(LucideIcons.logOut, color: Colors.red),
        label: Text('Log Out', style: GoogleFonts.inter(color: Colors.red, fontWeight: FontWeight.w700)),
      ),
    );
  }

  void _editProfile(BuildContext context) {
    // Navigate back to onboarding but in "edit" mode or similar
    // For now, let's just show a snackbar
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Edit feature coming soon')));
  }
}
