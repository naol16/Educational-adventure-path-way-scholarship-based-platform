import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/chat/providers/chat_providers.dart';
import 'package:mobile/features/chat/models/chat_models.dart';
import 'package:mobile/features/chat/screens/mentor_chat_screen.dart';
import 'package:mobile/models/user.dart';

class CounselorMessagesScreen extends ConsumerWidget {
  const CounselorMessagesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final conversationsAsync = ref.watch(conversationsProvider);
    final currentUser = ref.watch(currentUserProvider);

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(context),
            const SizedBox(height: 16),
            Expanded(
              child: RefreshIndicator(
                onRefresh: () async => ref.invalidate(conversationsProvider),
                color: DesignSystem.primary(context),
                child: conversationsAsync.when(
                  data: (conversations) {
                    if (conversations.isEmpty) return _buildEmpty(context);
                    return ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      itemCount: conversations.length,
                      itemBuilder: (ctx, i) => _buildChatTile(context, conversations[i], currentUser?.id ?? 0),
                    );
                  },
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (e, _) => Center(child: Text('Error loading messages')),
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
                Text('Messages', style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 24, fontWeight: FontWeight.w800)),
                Text('Active student conversations', style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 13)),
              ],
            ),
          ),
          Icon(LucideIcons.messageSquare, color: DesignSystem.primary(context), size: 24),
        ],
      ),
    );
  }

  Widget _buildChatTile(BuildContext context, Conversation conv, int currentUserId) {
    final primary = DesignSystem.primary(context);
    final lastMsg = conv.lastMessage;
    final otherUser = conv.getOtherParticipant(currentUserId);

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GestureDetector(
        onTap: () {
          Navigator.push(context, MaterialPageRoute(
            builder: (_) => MentorChatScreen(conversationId: conv.id, otherUser: otherUser),
          ));
        },
        child: GlassContainer(
          padding: const EdgeInsets.all(16),
          borderRadius: 22,
          child: Row(
            children: [
              CircleAvatar(
                radius: 26,
                backgroundColor: primary.withValues(alpha: 0.1),
                backgroundImage: otherUser.avatarUrl != null ? NetworkImage(otherUser.avatarUrl!) : null,
                child: otherUser.avatarUrl == null
                    ? Text(otherUser.name.substring(0, 1).toUpperCase(), style: GoogleFonts.plusJakartaSans(color: primary, fontWeight: FontWeight.w800, fontSize: 18))
                    : null,
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(otherUser.name, style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontWeight: FontWeight.w700, fontSize: 15)),
                    Text(lastMsg?.content ?? 'No messages yet', style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (lastMsg != null)
                    Text(DateFormat('h:mm a').format(lastMsg.createdAt), style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 10)),
                  const SizedBox(height: 6),
                  if (conv.unreadCount > 0)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(color: primary, borderRadius: BorderRadius.circular(10)),
                      child: Text('${conv.unreadCount}', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
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
          Icon(LucideIcons.messageSquare, color: DesignSystem.labelText(context), size: 56),
          const SizedBox(height: 16),
          Text('No messages yet', style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 18, fontWeight: FontWeight.w700)),
          Text('Conversations will appear here.', style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 13)),
        ],
      ),
    );
  }
}
