import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/chat/models/chat_models.dart';
import 'package:mobile/features/chat/services/chat_service.dart';
import 'package:mobile/features/chat/providers/chat_providers.dart';
import 'package:mobile/features/chat/providers/chat_state_notifier.dart';
import 'package:mobile/core/services/socket_service.dart';
import 'package:mobile/core/providers/dependencies.dart';
import 'package:mobile/models/user.dart';
import 'package:intl/intl.dart';
import 'package:file_picker/file_picker.dart';

class MentorChatScreen extends ConsumerStatefulWidget {
  final int conversationId;
  final User otherUser;

  const MentorChatScreen({
    super.key,
    required this.conversationId,
    required this.otherUser,
  });

  @override
  ConsumerState<MentorChatScreen> createState() => _MentorChatScreenState();
}

class _MentorChatScreenState extends ConsumerState<MentorChatScreen> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  Timer? _typingTimer;

  @override
  void initState() {
    super.initState();
    // Connect to socket when entering the chat screen
    Future.microtask(() => ref.read(socketServiceProvider).connect());
  }

  void _onTextChanged(String text) {
    ref.read(chatStateProvider(widget.conversationId).notifier).sendTyping(true);
    _typingTimer?.cancel();
    _typingTimer = Timer(const Duration(seconds: 2), () {
      ref.read(chatStateProvider(widget.conversationId).notifier).sendTyping(false);
    });
  }

  void _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    _controller.clear();
    _typingTimer?.cancel();
    ref.read(chatStateProvider(widget.conversationId).notifier).sendTyping(false);
    
    await ref.read(chatServiceProvider).sendMessage(widget.otherUser.id, text);
    // Real-time update comes via Socket.io -> ChatNotifier
  }

  void _attachFile() async {
    final result = await FilePicker.platform.pickFiles();
    if (result != null && result.files.single.path != null) {
      final url = await ref.read(chatServiceProvider).uploadFile(result.files.single.path!);
      if (url != null) {
        await ref.read(chatServiceProvider).sendMessage(widget.otherUser.id, "Shared a file: $url");
      }
    }
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final chatState = ref.watch(chatStateProvider(widget.conversationId));
    final currentUser = ref.watch(currentUserProvider);

    // Auto scroll when messages change
    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      appBar: _buildAppBar(context, chatState.isTyping),
      body: Stack(
        children: [
          Positioned(top: 100, left: -50, child: DesignSystem.buildBlurCircle(DesignSystem.primary(context).withValues(alpha: 0.05), 300)),
          
          Column(
            children: [
              Expanded(
                child: chatState.isLoading
                  ? Center(child: CircularProgressIndicator(color: DesignSystem.primary(context)))
                  : ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                      itemCount: chatState.messages.length,
                      itemBuilder: (context, index) {
                        final msg = chatState.messages[index];
                        final isMe = msg.senderId == currentUser?.id;
                        return _buildMessageBubble(msg, isMe);
                      },
                    ),
              ),
              _buildInputArea(context),
            ],
          ),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context, bool isTyping) {
    return AppBar(
      backgroundColor: DesignSystem.themeBackground(context).withValues(alpha: 0.8),
      elevation: 0,
      flexibleSpace: ClipRect(child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10), child: Container(color: Colors.transparent))),
      leading: IconButton(
        icon: Icon(LucideIcons.chevronLeft, color: DesignSystem.mainText(context)),
        onPressed: () => Navigator.pop(context),
      ),
      title: Row(
        children: [
          Stack(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: DesignSystem.surfaceMediumColor(context),
                backgroundImage: widget.otherUser.avatarUrl != null ? NetworkImage(widget.otherUser.avatarUrl!) : null,
                child: widget.otherUser.avatarUrl == null ? Icon(LucideIcons.user, size: 16, color: DesignSystem.labelText(context)) : null,
              ),
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(color: const Color(0xFF10B981), shape: BoxShape.circle, border: Border.all(color: DesignSystem.themeBackground(context), width: 2)),
                ),
              ),
            ],
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(widget.otherUser.name, style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontWeight: FontWeight.bold, fontSize: 16)),
              Text(isTyping ? "typing..." : "Online", style: GoogleFonts.inter(color: const Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.w500)),
            ],
          ),
        ],
      ),
      actions: [
        IconButton(icon: Icon(LucideIcons.video, color: DesignSystem.labelText(context), size: 20), onPressed: () {}),
        IconButton(icon: Icon(LucideIcons.phone, color: DesignSystem.labelText(context), size: 20), onPressed: () {}),
        const SizedBox(width: 8),
      ],
    );
  }

  Widget _buildMessageBubble(ChatMessage msg, bool isMe) {
    final primaryColor = DesignSystem.primary(context);
    final timeStr = DateFormat('jm').format(msg.createdAt);
    final isFile = msg.content.startsWith("Shared a file: ");

    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        child: Column(
          crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: isMe ? primaryColor : DesignSystem.surface(context),
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(20),
                  topRight: const Radius.circular(20),
                  bottomLeft: isMe ? const Radius.circular(20) : Radius.zero,
                  bottomRight: isMe ? Radius.zero : const Radius.circular(20),
                ),
                boxShadow: isMe ? [BoxShadow(color: primaryColor.withValues(alpha: 0.3), blurRadius: 10, offset: const Offset(0, 4))] : null,
              ),
              child: isFile 
                ? _buildFileContent(msg.content.substring(15), isMe)
                : Text(
                    msg.content,
                    style: GoogleFonts.inter(
                      color: isMe ? (Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white) : DesignSystem.mainText(context),
                      height: 1.4,
                      fontSize: 14,
                    ),
                  ),
            ),
            const SizedBox(height: 4),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(timeStr, style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 10)),
                if (isMe) ...[
                  const SizedBox(width: 4),
                  Icon(LucideIcons.checkCheck, color: msg.isRead ? Colors.blue : DesignSystem.labelText(context), size: 12),
                ]
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFileContent(String url, bool isMe) {
    bool isImage = url.toLowerCase().contains(".jpg") || url.toLowerCase().contains(".png") || url.toLowerCase().contains(".jpeg");
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (isImage)
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.network(url, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(LucideIcons.file)),
          )
        else
          Row(
            children: [
              Icon(LucideIcons.file, color: isMe ? Colors.white : DesignSystem.primary(context)),
              const SizedBox(width: 8),
              Expanded(child: Text("Document", style: TextStyle(color: isMe ? Colors.white : DesignSystem.mainText(context)))),
            ],
          ),
        const SizedBox(height: 8),
        Text("Click to view", style: TextStyle(fontSize: 10, color: isMe ? Colors.white70 : DesignSystem.labelText(context))),
      ],
    );
  }

  Widget _buildInputArea(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(20, 12, 20, MediaQuery.of(context).padding.bottom + 12),
      decoration: BoxDecoration(
        color: DesignSystem.themeBackground(context).withValues(alpha: 0.95),
        border: Border(top: BorderSide(color: DesignSystem.glassBorder(context))),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: _attachFile,
            child: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: DesignSystem.surface(context), shape: BoxShape.circle),
              child: Icon(LucideIcons.plus, color: DesignSystem.labelText(context), size: 20),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: GlassContainer(
              borderRadius: 24,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: TextField(
                controller: _controller,
                onChanged: _onTextChanged,
                style: GoogleFonts.inter(color: DesignSystem.mainText(context)),
                decoration: InputDecoration(
                  hintText: "Type a message...",
                  hintStyle: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 14),
                  border: InputBorder.none,
                ),
                onSubmitted: (_) => _sendMessage(),
              ),
            ),
          ),
          const SizedBox(width: 12),
          GestureDetector(
            onTap: _sendMessage,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: DesignSystem.primary(context), shape: BoxShape.circle),
              child: const Icon(LucideIcons.send, color: Colors.black, size: 20),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _typingTimer?.cancel();
    super.dispose();
  }
}
