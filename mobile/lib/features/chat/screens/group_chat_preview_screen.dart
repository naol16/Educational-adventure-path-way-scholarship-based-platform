import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/chat/models/chat_models.dart';
import 'package:mobile/features/chat/providers/chat_providers.dart';
import 'package:mobile/features/chat/providers/chat_state_notifier.dart';
import 'package:mobile/features/chat/providers/group_chat_providers.dart';
import 'package:mobile/features/chat/screens/mentor_chat_screen.dart';
import 'package:intl/intl.dart';
import 'package:mobile/models/user.dart';

/// Telegram-style group preview: user can read messages, then join at the bottom.
class GroupChatPreviewScreen extends ConsumerStatefulWidget {
  final Conversation group;

  const GroupChatPreviewScreen({super.key, required this.group});

  @override
  ConsumerState<GroupChatPreviewScreen> createState() => _GroupChatPreviewScreenState();
}

class _GroupChatPreviewScreenState extends ConsumerState<GroupChatPreviewScreen> {
  bool _isJoining = false;

  @override
  Widget build(BuildContext context) {
    final chatState = ref.watch(chatStateProvider(widget.group.id));
    final currentUser = ref.watch(currentUserProvider);
    final isJoined = widget.group.isJoined;

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      appBar: _buildAppBar(context),
      body: Column(
        children: [
          // Messages list (read-only if not joined)
          Expanded(
            child: _buildMessageList(chatState, currentUser?.id ?? 0),
          ),

          // Bottom bar: join button or input area
          if (isJoined)
            _buildAlreadyJoinedBar(context)
          else
            _buildJoinBar(context),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return AppBar(
      backgroundColor: DesignSystem.themeBackground(context).withValues(alpha: 0.95),
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      flexibleSpace: ClipRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(color: Colors.transparent),
        ),
      ),
      leading: IconButton(
        icon: Icon(LucideIcons.chevronLeft, color: DesignSystem.mainText(context)),
        onPressed: () => Navigator.pop(context),
      ),
      titleSpacing: 0,
      title: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: DesignSystem.primary(context).withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(LucideIcons.users, size: 18, color: DesignSystem.primary(context)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.group.name ?? 'Community Group',
                  style: GoogleFonts.plusJakartaSans(
                    color: DesignSystem.mainText(context),
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                Row(
                  children: [
                    Icon(LucideIcons.globe, size: 10, color: DesignSystem.primary(context)),
                    const SizedBox(width: 3),
                    Text(
                      '${widget.group.country ?? "Global"} · ${widget.group.participants.length} members',
                      style: GoogleFonts.inter(
                        color: DesignSystem.labelText(context),
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageList(ChatState chatState, int currentUserId) {
    if (chatState.isLoading && chatState.messages.isEmpty) {
      return Center(child: CircularProgressIndicator(color: DesignSystem.primary(context)));
    }

    if (chatState.messages.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(LucideIcons.messageCircle, color: DesignSystem.labelText(context), size: 56),
            const SizedBox(height: 12),
            Text('No messages yet',
                style: GoogleFonts.plusJakartaSans(
                    color: DesignSystem.labelText(context),
                    fontSize: 16,
                    fontWeight: FontWeight.w600)),
            const SizedBox(height: 4),
            Text(
              widget.group.isJoined 
                ? 'Be the first to say something!'
                : 'Join the group to start chatting',
              style: GoogleFonts.inter(
                  color: DesignSystem.labelText(context).withValues(alpha: 0.6),
                  fontSize: 13),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: chatState.messages.length,
      itemBuilder: (context, index) {
        final msg = chatState.messages[index];
        final isMe = msg.senderId == currentUserId;
        final showDate = index == 0 ||
            !_isSameDay(chatState.messages[index - 1].createdAt, msg.createdAt);
        final isFirstInGroup = index == 0 ||
            chatState.messages[index - 1].senderId != msg.senderId || showDate;
        final isLastInGroup = index == chatState.messages.length - 1 ||
            chatState.messages[index + 1].senderId != msg.senderId;

        return Column(
          children: [
            if (showDate) _buildDateSeparator(msg.createdAt),
            _buildMessageBubble(msg, isMe, isFirstInGroup, isLastInGroup),
          ],
        );
      },
    );
  }

  Widget _buildDateSeparator(DateTime date) {
    final now = DateTime.now();
    String label;
    if (_isSameDay(date, now)) {
      label = 'Today';
    } else if (_isSameDay(date, now.subtract(const Duration(days: 1)))) {
      label = 'Yesterday';
    } else {
      label = DateFormat('MMM d, yyyy').format(date);
    }
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        children: [
          Expanded(child: Divider(color: DesignSystem.glassBorder(context))),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Text(label,
                style: GoogleFonts.inter(
                    color: DesignSystem.labelText(context),
                    fontSize: 11,
                    fontWeight: FontWeight.w500)),
          ),
          Expanded(child: Divider(color: DesignSystem.glassBorder(context))),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage msg, bool isMe, bool isFirstInGroup, bool isLastInGroup) {
    final primaryColor = DesignSystem.primary(context);
    final timeStr = DateFormat('h:mm a').format(msg.createdAt);

    final bubbleRadius = BorderRadius.only(
      topLeft: Radius.circular(isMe || !isFirstInGroup ? 18 : 4),
      topRight: Radius.circular(!isMe || !isFirstInGroup ? 18 : 4),
      bottomLeft: Radius.circular(isMe ? 18 : (isLastInGroup ? 4 : 18)),
      bottomRight: Radius.circular(!isMe ? 18 : (isLastInGroup ? 4 : 18)),
    );

    return Padding(
      padding: EdgeInsets.only(bottom: isLastInGroup ? 8 : 2, top: isFirstInGroup ? 4 : 0),
      child: Row(
        mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isMe) ...[
            if (isLastInGroup)
              CircleAvatar(
                radius: 14,
                backgroundColor: DesignSystem.surfaceMediumColor(context),
                child: Icon(LucideIcons.user, size: 12, color: DesignSystem.labelText(context)),
              )
            else
              const SizedBox(width: 28),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Column(
              crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                if (!isMe && isFirstInGroup)
                  Padding(
                    padding: const EdgeInsets.only(left: 4, bottom: 4),
                    child: Text(
                      msg.senderName ?? 'Member',
                      style: GoogleFonts.inter(
                        color: primaryColor,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                Container(
                  constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.72),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: isMe ? primaryColor : DesignSystem.surface(context),
                    borderRadius: bubbleRadius,
                    boxShadow: isMe
                        ? [BoxShadow(
                            color: primaryColor.withValues(alpha: 0.25),
                            blurRadius: 8,
                            offset: const Offset(0, 3))]
                        : null,
                  ),
                  child: Text(
                    msg.content,
                    style: GoogleFonts.inter(
                      color: isMe
                          ? (Theme.of(context).brightness == Brightness.dark
                              ? Colors.black
                              : Colors.white)
                          : DesignSystem.mainText(context),
                      height: 1.45,
                      fontSize: 14,
                    ),
                  ),
                ),
                if (isLastInGroup)
                  Padding(
                    padding: const EdgeInsets.only(top: 3, left: 4, right: 4),
                    child: Text(timeStr,
                        style: GoogleFonts.inter(
                            color: DesignSystem.labelText(context), fontSize: 10)),
                  ),
              ],
            ),
          ),
          if (isMe) const SizedBox(width: 4),
        ],
      ),
    );
  }

  /// Shown when the user has NOT joined yet — big "Join Group" button at the bottom.
  Widget _buildJoinBar(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(20, 12, 20, MediaQuery.of(context).padding.bottom + 12),
      decoration: BoxDecoration(
        color: DesignSystem.themeBackground(context),
        border: Border(top: BorderSide(color: DesignSystem.glassBorder(context), width: 0.5)),
      ),
      child: GestureDetector(
        onTap: _isJoining ? null : _handleJoin,
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            gradient: DesignSystem.easyPhaseGradient,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: DesignSystem.primary(context).withValues(alpha: 0.25),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Center(
            child: _isJoining
                ? const SizedBox(
                    height: 22,
                    width: 22,
                    child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.black),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(LucideIcons.userPlus, color: Colors.black, size: 18),
                      const SizedBox(width: 10),
                      Text(
                        "Join Group",
                        style: GoogleFonts.plusJakartaSans(
                          color: Colors.black,
                          fontWeight: FontWeight.w800,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }

  /// Shown when the user has already joined — open the full chat.
  Widget _buildAlreadyJoinedBar(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(20, 12, 20, MediaQuery.of(context).padding.bottom + 12),
      decoration: BoxDecoration(
        color: DesignSystem.themeBackground(context),
        border: Border(top: BorderSide(color: DesignSystem.glassBorder(context), width: 0.5)),
      ),
      child: GestureDetector(
        onTap: () {
          final currentUser = ref.read(currentUserProvider);
          if (currentUser == null) return;
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (_) => MentorChatScreen(
                conversationId: widget.group.id,
                otherUser: widget.group.getOtherParticipant(currentUser.id),
                isGroup: true,
                groupName: widget.group.name,
              ),
            ),
          );
        },
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: DesignSystem.primary(context).withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: DesignSystem.primary(context).withValues(alpha: 0.3)),
          ),
          child: Center(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(LucideIcons.messageSquare, color: DesignSystem.primary(context), size: 18),
                const SizedBox(width: 10),
                Text(
                  "Open Chat",
                  style: GoogleFonts.plusJakartaSans(
                    color: DesignSystem.primary(context),
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _handleJoin() async {
    setState(() => _isJoining = true);
    final success = await ref.read(groupChatActionProvider.notifier).joinGroup(widget.group.id);
    if (mounted) {
      setState(() => _isJoining = false);
      if (success) {
        final currentUser = ref.read(currentUserProvider);
        if (currentUser != null && mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (_) => MentorChatScreen(
                conversationId: widget.group.id,
                otherUser: widget.group.getOtherParticipant(currentUser.id),
                isGroup: true,
                groupName: widget.group.name,
              ),
            ),
          );
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to join group. Please try again.')),
        );
      }
    }
  }

  bool _isSameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;
}
