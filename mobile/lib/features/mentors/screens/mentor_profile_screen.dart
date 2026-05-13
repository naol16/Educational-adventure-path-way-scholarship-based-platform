import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:mobile/features/mentors/models/counselor.dart';
import 'package:mobile/features/chat/providers/chat_providers.dart';
import 'package:mobile/features/chat/screens/mentor_chat_screen.dart';
import 'package:mobile/features/mentors/widgets/booking_bottom_sheet.dart';
import 'package:mobile/features/mentors/providers/mentors_providers.dart';
import 'package:mobile/features/mentors/models/booking_models.dart';
import 'package:intl/intl.dart';
import 'package:mobile/models/user.dart';

class MentorProfileScreen extends ConsumerWidget {
  final Counselor mentor;

  const MentorProfileScreen({super.key, required this.mentor});

  void _startChat(BuildContext context, WidgetRef ref) async {
    // Show loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    final chatService = ref.read(chatServiceProvider);
    final conversation = await chatService.startChat(mentor.userId);
    
    if (context.mounted) {
      Navigator.pop(context); // Pop loading

      if (conversation != null) {
        final currentUser = ref.read(currentUserProvider);
        final otherUser = conversation.getOtherParticipant(currentUser?.id ?? 0);
        
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => MentorChatScreen(
              conversationId: conversation.id,
              otherUser: otherUser,
            ),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Failed to start conversation")),
        );
      }
    }
  }

  void _openBookingSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => BookingBottomSheet(
        counselorId: mentor.id,
        counselorName: mentor.currentPosition ?? "Mentor",
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: Stack(
        children: [
          // Background Depth
          Positioned(top: -100, right: -100, child: DesignSystem.buildBlurCircle(const Color(0xFF10B981).withValues(alpha: 0.1), 300)),
          
          CustomScrollView(
            slivers: [
              _buildAppBar(context),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildMainStats(context),
                      const SizedBox(height: 32),
                      _buildSectionTitle(context, "About Me"),
                      const SizedBox(height: 12),
                      Text(
                        mentor.bio,
                        style: GoogleFonts.inter(color: DesignSystem.mainText(context).withValues(alpha: 0.8), height: 1.6, fontSize: 15),
                      ),
                      const SizedBox(height: 32),
                      _buildSectionTitle(context, "Expertise"),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: mentor.areasOfExpertise.map((e) => _buildExpertiseChip(context, e)).toList(),
                      ),
                      const SizedBox(height: 32),
                      _buildSectionTitle(context, "Education"),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Icon(LucideIcons.graduationCap, color: DesignSystem.primary(context), size: 18),
                          const SizedBox(width: 12),
                          Text(mentor.universityName ?? "Top Tier University", style: GoogleFonts.inter(color: DesignSystem.mainText(context), fontSize: 15)),
                        ],
                      ),
                      const SizedBox(height: 32),
                      _buildSectionTitle(context, "Specialized Countries"),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: mentor.specializedCountries.map((c) => _buildCountryChip(context, c)).toList(),
                      ),
                      _buildSectionTitle(context, "Student Reviews"),
                      const SizedBox(height: 12),
                      _buildReviewsList(context, ref, mentor.id),
                      const SizedBox(height: 100), // Bottom padding for actions
                    ],
                  ),
                ),
              ),
            ],
          ),
          
          _buildBottomActions(context, ref),
        ],
      ),
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return SliverAppBar(
      expandedHeight: 340,
      pinned: true,
      backgroundColor: DesignSystem.themeBackground(context),
      leading: IconButton(
        icon: Icon(LucideIcons.chevronLeft, color: DesignSystem.mainText(context)),
        onPressed: () => Navigator.pop(context),
      ),
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            if (mentor.profileImageUrl != null)
              Image.network(mentor.profileImageUrl!, fit: BoxFit.cover)
            else
              Container(color: DesignSystem.surfaceMediumColor(context), child: Icon(LucideIcons.user, size: 80, color: DesignSystem.labelText(context))),
            
            // Gradient Overlay
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    DesignSystem.themeBackground(context).withValues(alpha: 0.8),
                    DesignSystem.themeBackground(context),
                  ],
                ),
              ),
            ),
            
            Positioned(
              bottom: 20,
              left: 24,
              right: 24,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(mentor.currentPosition ?? "Expert Mentor", style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontWeight: FontWeight.w800, fontSize: 26), overflow: TextOverflow.ellipsis),
                      ),
                      if (mentor.verificationStatus == 'verified') ...[
                        const SizedBox(width: 8),
                        const Icon(Icons.verified, color: Colors.blue, size: 22),
                      ]
                    ],
                  ),
                  Text(mentor.organization ?? "Global Education Consultant", style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 16), overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _buildMatchBadge("${(mentor.matchScore ?? 0).toStringAsFixed(0)}% Match Profile"),
                      const SizedBox(width: 12),
                      Icon(Icons.star, color: Colors.amber, size: 18),
                      const SizedBox(width: 4),
                      Text("${mentor.rating.toStringAsFixed(1)} (120+ Reviews)", style: GoogleFonts.inter(color: DesignSystem.mainText(context), fontWeight: FontWeight.bold, fontSize: 14)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMainStats(BuildContext context) {
    return Row(
      children: [
        _buildStatItem(context, LucideIcons.briefcase, "${mentor.yearsOfExperience}y", "Experience"),
        _buildStatItem(context, LucideIcons.users, "${mentor.totalSessions}", "Sessions"),
        _buildStatItem(context, LucideIcons.dollarSign, "${mentor.hourlyRate.toInt()}", "Per Hour"),
      ],
    );
  }

  Widget _buildStatItem(BuildContext context, IconData icon, String value, String label) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4),
        child: GlassContainer(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            children: [
              Icon(icon, color: DesignSystem.primary(context), size: 20),
              const SizedBox(height: 8),
              Text(value, style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontWeight: FontWeight.bold, fontSize: 18)),
              Text(label, style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 11)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Text(title, style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontWeight: FontWeight.bold, fontSize: 18));
  }

  Widget _buildExpertiseChip(BuildContext context, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(color: DesignSystem.surface(context), borderRadius: BorderRadius.circular(12), border: Border.all(color: DesignSystem.glassBorder(context))),
      child: Text(text, style: GoogleFonts.inter(color: DesignSystem.mainText(context), fontSize: 13, fontWeight: FontWeight.w500)),
    );
  }

  Widget _buildCountryChip(BuildContext context, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(color: DesignSystem.primary(context).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(LucideIcons.mapPin, color: DesignSystem.primary(context), size: 14),
          const SizedBox(width: 6),
          Text(text, style: GoogleFonts.inter(color: DesignSystem.primary(context), fontSize: 13, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildBottomActions(BuildContext context, WidgetRef ref) {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        padding: EdgeInsets.fromLTRB(24, 20, 24, MediaQuery.of(context).padding.bottom + 20),
        decoration: BoxDecoration(
          color: DesignSystem.themeBackground(context).withValues(alpha: 0.95),
          border: Border(top: BorderSide(color: DesignSystem.glassBorder(context))),
        ),
        child: Row(
          children: [
            Expanded(
              flex: 1,
              child: PrimaryButton(
                onPressed: () => _startChat(context, ref),
                text: "",
                icon: const Icon(LucideIcons.messageSquare),
                isOutlined: true,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              flex: 3,
              child: PrimaryButton(
                onPressed: () => _openBookingSheet(context),
                text: "Book Session",
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewsList(BuildContext context, WidgetRef ref, int counselorId) {
    final reviewsAsync = ref.watch(counselorReviewsProvider(counselorId));

    return reviewsAsync.when(
      data: (reviews) {
        if (reviews.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 20),
              child: Text("No reviews yet.", style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 13)),
            ),
          );
        }
        return Column(
          children: reviews.map((r) => _buildReviewCard(context, r)).toList(),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Text("Error loading reviews", style: TextStyle(color: Colors.red)),
    );
  }

  Widget _buildReviewCard(BuildContext context, Review review) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GlassContainer(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(review.studentName ?? "Anonymous Student", style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: DesignSystem.mainText(context))),
                Row(
                  children: List.generate(5, (i) => Icon(Icons.star, size: 12, color: i < review.rating ? Colors.amber : DesignSystem.labelText(context).withValues(alpha: 0.3))),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(review.comment ?? "No comment provided.", style: GoogleFonts.inter(color: DesignSystem.mainText(context).withValues(alpha: 0.7), fontSize: 13, height: 1.4)),
            const SizedBox(height: 4),
            Text(DateFormat('MMM d, yyyy').format(review.createdAt), style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 10)),
          ],
        ),
      ),
    );
  }

  Widget _buildMatchBadge(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: const Color(0xFF10B981).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
      child: Text(text, style: GoogleFonts.inter(color: const Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
    );
  }
}
