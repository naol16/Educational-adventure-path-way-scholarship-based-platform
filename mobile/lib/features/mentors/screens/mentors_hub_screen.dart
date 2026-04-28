import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/mentors/providers/mentors_providers.dart';
import 'package:mobile/features/chat/providers/chat_providers.dart';
import 'package:mobile/features/mentors/models/counselor.dart';
import 'package:mobile/features/chat/models/chat_models.dart';
import 'package:intl/intl.dart';
import 'package:mobile/features/mentors/screens/mentor_profile_screen.dart';
import 'package:mobile/features/chat/screens/mentor_chat_screen.dart';

class MentorsHubScreen extends ConsumerStatefulWidget {
  const MentorsHubScreen({super.key});

  @override
  ConsumerState<MentorsHubScreen> createState() => _MentorsHubScreenState();
}

class _MentorsHubScreenState extends ConsumerState<MentorsHubScreen> {
  int _activeSubTab = 0; // 0 for Experts, 1 for Messages

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: Stack(
        children: [
          // Background Depth
          Positioned(top: -50, right: -50, child: DesignSystem.buildBlurCircle(const Color(0xFF10B981).withValues(alpha: 0.05), 200)),
          Positioned(bottom: 100, left: -100, child: DesignSystem.buildBlurCircle(DesignSystem.primary(context).withValues(alpha: 0.03), 300)),

          SafeArea(
            child: Column(
              children: [
                const SizedBox(height: 20),
                _buildHeader(),
                const SizedBox(height: 20),
                _buildSubTabSwitcher(),
                const SizedBox(height: 25),
                Expanded(
                  child: _activeSubTab == 0 ? _buildExpertsList() : _buildMessagesList(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("Mentors Hub", style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontWeight: FontWeight.w800, fontSize: 24)),
              Text("Learn from the best in the field", style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 14)),
            ],
          ),
          GlassContainer(
            padding: const EdgeInsets.all(10),
            borderRadius: 12,
            child: Icon(LucideIcons.search, color: DesignSystem.mainText(context), size: 20),
          ),
        ],
      ),
    );
  }

  // --- SUB-TAB SWITCHER (Experts vs Messages) ---
  Widget _buildSubTabSwitcher() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(color: DesignSystem.surface(context), borderRadius: BorderRadius.circular(20)),
        child: Row(
          children: [
            _buildSubTab("Experts", 0),
            _buildSubTab("Messages", 1),
          ],
        ),
      ),
    );
  }

  Widget _buildSubTab(String label, int index) {
    bool isActive = _activeSubTab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _activeSubTab = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isActive ? DesignSystem.primary(context) : Colors.transparent,
            borderRadius: BorderRadius.circular(15),
          ),
          child: Center(
            child: Text(
              label,
              style: GoogleFonts.inter(
                color: isActive ? (Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white) : DesignSystem.labelText(context), 
                fontWeight: FontWeight.bold, 
                fontSize: 13
              ),
            ),
          ),
        ),
      ),
    );
  }

  // --- VIEW 1: EXPERTS MARKETPLACE ---
  Widget _buildExpertsList() {
    final mentorsAsync = ref.watch(recommendedCounselorsProvider);

    return mentorsAsync.when(
      data: (mentors) => ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: mentors.length,
        itemBuilder: (context, index) => _buildMentorCard(mentors[index]),
      ),
      loading: () => _buildShimmerList(),
      error: (err, stack) => Center(child: Text("Error loading experts", style: TextStyle(color: Colors.red))),
    );
  }

  Widget _buildMentorCard(Counselor mentor) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 15),
      child: GestureDetector(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => MentorProfileScreen(mentor: mentor),
            ),
          );
        },
        child: GlassContainer(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              Hero(
                tag: 'mentor_${mentor.id}',
                child: CircleAvatar(
                  radius: 30, 
                  backgroundColor: DesignSystem.surfaceMediumColor(context),
                  backgroundImage: mentor.profileImageUrl != null ? NetworkImage(mentor.profileImageUrl!) : null,
                  child: mentor.profileImageUrl == null ? Icon(LucideIcons.user, color: DesignSystem.labelText(context)) : null,
                ),
              ),
              const SizedBox(width: 15),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(mentor.currentPosition ?? "Expert Mentor", style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontWeight: FontWeight.bold, fontSize: 16)),
                        if (mentor.verificationStatus == 'verified') ...[
                          const SizedBox(width: 4),
                          const Icon(Icons.verified, color: Colors.blue, size: 14),
                        ]
                      ],
                    ),
                    Text("${mentor.organization ?? 'Independent'} • ${mentor.yearsOfExperience}y Exp", style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 12)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        _buildMatchBadge("${(mentor.matchScore ?? 0).toStringAsFixed(0)}% Match"),
                        const SizedBox(width: 8),
                        Icon(Icons.star, color: Colors.amber, size: 14),
                        const SizedBox(width: 2),
                        Text(mentor.rating.toStringAsFixed(1), style: GoogleFonts.inter(color: DesignSystem.mainText(context), fontWeight: FontWeight.bold, fontSize: 12)),
                      ],
                    ),
                  ],
                ),
              ),
              Column(
                children: [
                  Text("\$${mentor.hourlyRate.toInt()}", style: GoogleFonts.plusJakartaSans(color: DesignSystem.primary(context), fontWeight: FontWeight.w800, fontSize: 18)),
                  Text("/hr", style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 10)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // --- VIEW 2: MESSAGES / INBOX ---
  Widget _buildMessagesList() {
    final conversationsAsync = ref.watch(conversationsProvider);

    return conversationsAsync.when(
      data: (conversations) {
        if (conversations.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(LucideIcons.messageSquare, color: DesignSystem.labelText(context), size: 64),
                const SizedBox(height: 16),
                Text("No messages yet", style: GoogleFonts.plusJakartaSans(color: DesignSystem.labelText(context), fontSize: 18, fontWeight: FontWeight.bold)),
                Text("Start a conversation with a mentor", style: GoogleFonts.inter(color: DesignSystem.labelText(context).withValues(alpha: 0.6))),
              ],
            ),
          );
        }
        return ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          itemCount: conversations.length,
          itemBuilder: (context, index) => _buildChatTile(conversations[index]),
        );
      },
      loading: () => _buildShimmerList(),
      error: (err, stack) => Center(child: Text("Error loading messages", style: TextStyle(color: Colors.red))),
    );
  }

  Widget _buildChatTile(Conversation conversation) {
    final currentUser = ref.watch(currentUserProvider);
    if (currentUser == null) return const SizedBox.shrink();
    
    final otherUser = conversation.getOtherParticipant(currentUser.id);
    final lastMsg = conversation.lastMessage;
    final timeStr = lastMsg != null ? DateFormat('jm').format(lastMsg.createdAt) : "";

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GestureDetector(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => MentorChatScreen(
                conversationId: conversation.id,
                otherUser: otherUser,
              ),
            ),
          );
        },
        child: GlassContainer(
          padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 15),
          borderRadius: 20,
          child: Row(
            children: [
              CircleAvatar(
                radius: 26, 
                backgroundColor: DesignSystem.surfaceMediumColor(context),
                backgroundImage: otherUser.avatarUrl != null ? NetworkImage(otherUser.avatarUrl!) : null,
                child: otherUser.avatarUrl == null ? Icon(LucideIcons.user, color: DesignSystem.labelText(context)) : null,
              ),
              const SizedBox(width: 15),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(otherUser.name, style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontWeight: FontWeight.bold, fontSize: 15)),
                        Text(timeStr, style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 11)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(lastMsg?.content ?? "Start a conversation...", style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 13), overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
              if (conversation.unreadCount > 0)
                Container(
                  margin: const EdgeInsets.only(left: 10),
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: DesignSystem.primary(context), borderRadius: BorderRadius.circular(10)),
                  child: Text(conversation.unreadCount.toString(), style: const TextStyle(color: Colors.black, fontSize: 10, fontWeight: FontWeight.bold)),
                )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildShimmerList() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: 4,
      itemBuilder: (context, index) => Padding(
        padding: const EdgeInsets.only(bottom: 15),
        child: SizedBox(
          height: 100,
          child: GlassContainer(
            child: Center(child: CircularProgressIndicator(color: DesignSystem.primary(context).withValues(alpha: 0.3))),
          ),
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

