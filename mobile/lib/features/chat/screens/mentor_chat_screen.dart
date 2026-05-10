import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/chat/models/chat_models.dart';
import 'package:mobile/features/chat/providers/chat_providers.dart';
import 'package:mobile/features/chat/providers/chat_state_notifier.dart';
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

class _MentorChatScreenState extends ConsumerState<MentorChatScreen>
    with WidgetsBindingObserver {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _focusNode = FocusNode();
  Timer? _typingTimer;
  bool _showScrollToBottom = false;
  bool _isComposing = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _scrollController.addListener(_onScroll);
    Future.microtask(() async {
      await ref.read(socketServiceProvider).connect();
      ref.read(chatServiceProvider).markAsRead(widget.conversationId);
      ref.invalidate(conversationsProvider);
    });
  }

  @override
  void didChangeMetrics() {
    final bottomInset =
        WidgetsBinding.instance.platformDispatcher.views.first.viewInsets.bottom;
    if (bottomInset > 0) {
      Future.delayed(const Duration(milliseconds: 100), _scrollToBottom);
    }
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final atBottom = _scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 100;
    if (_showScrollToBottom == atBottom) {
      setState(() => _showScrollToBottom = !atBottom);
    }
    if (_scrollController.position.pixels <= 80) {
      ref.read(chatStateProvider(widget.conversationId).notifier).loadMore();
    }
  }

  void _onTextChanged(String text) {
    final composing = text.trim().isNotEmpty;
    if (composing != _isComposing) setState(() => _isComposing = composing);
    ref.read(chatStateProvider(widget.conversationId).notifier).sendTyping(true);
    _typingTimer?.cancel();
    _typingTimer = Timer(const Duration(seconds: 2), () {
      ref.read(chatStateProvider(widget.conversationId).notifier).sendTyping(false);
    });
  }

  void _sendMessage() {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    _controller.clear();
    setState(() => _isComposing = false);
    _typingTimer?.cancel();
    ref.read(chatStateProvider(widget.conversationId).notifier).sendTyping(false);
    ref
        .read(chatStateProvider(widget.conversationId).notifier)
        .sendMessage(widget.otherUser.id, text);
    Future.delayed(const Duration(milliseconds: 50), _scrollToBottom);
  }

  void _attachFile() async {
    final result = await FilePicker.platform.pickFiles();
    if (result != null && result.files.single.path != null) {
      final url =
          await ref.read(chatServiceProvider).uploadFile(result.files.single.path!);
      if (url != null && mounted) {
        ref
            .read(chatStateProvider(widget.conversationId).notifier)
            .sendMessage(widget.otherUser.id, 'Shared a file: $url');
      }
    }
  }

  void _scrollToBottom({bool animated = true}) {
    if (!_scrollController.hasClients) return;
    if (animated) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOut,
      );
    } else {
      _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
    }
  }


  @override
  Widget build(BuildContext context) {
    final chatState = ref.watch(chatStateProvider(widget.conversationId));
    final currentUser = ref.watch(currentUserProvider);

    ref.listen(chatStateProvider(widget.conversationId), (prev, next) {
      if (prev != null && next.messages.length > prev.messages.length) {
        final lastMsg = next.messages.last;
        final isMyMsg = lastMsg.senderId == currentUser?.id;
        final nearBottom = _scrollController.hasClients &&
            _scrollController.position.pixels >=
                _scrollController.position.maxScrollExtent - 200;
        if (isMyMsg || nearBottom) {
          Future.delayed(const Duration(milliseconds: 50), _scrollToBottom);
        }
      }
    });

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      appBar: _buildAppBar(context, chatState.isTyping),
      body: Column(
        children: [
          Expanded(
            child: Stack(
              children: [
                _buildMessageList(chatState, currentUser?.id ?? 0),
                if (_showScrollToBottom)
                  Positioned(
                    bottom: 12,
                    right: 16,
                    child: _buildScrollToBottomButton(),
                  ),
              ],
            ),
          ),
          _buildInputArea(context),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context, bool isTyping) {
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
          Stack(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: DesignSystem.surfaceMediumColor(context),
                backgroundImage: widget.otherUser.avatarUrl != null
                    ? NetworkImage(widget.otherUser.avatarUrl!)
                    : null,
                child: widget.otherUser.avatarUrl == null
                    ? Icon(LucideIcons.user, size: 18, color: DesignSystem.labelText(context))
                    : null,
              ),
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981),
                    shape: BoxShape.circle,
                    border: Border.all(color: DesignSystem.themeBackground(context), width: 2),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.otherUser.name,
                  style: GoogleFonts.plusJakartaSans(
                    color: DesignSystem.mainText(context),
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 200),
                  child: Text(
                    isTyping ? 'typing...' : 'Online',
                    key: ValueKey(isTyping),
                    style: GoogleFonts.inter(
                      color: const Color(0xFF10B981),
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: Icon(LucideIcons.video, color: DesignSystem.labelText(context), size: 20),
          onPressed: () {},
        ),
        IconButton(
          icon: Icon(LucideIcons.phone, color: DesignSystem.labelText(context), size: 20),
          onPressed: () {},
        ),
        const SizedBox(width: 4),
      ],
    );
  }


  Widget _buildMessageList(ChatState chatState, int currentUserId) {
    if (chatState.isLoading && chatState.messages.isEmpty) {
      return Center(child: CircularProgressIndicator(color: DesignSystem.primary(context)));
    }

    if (chatState.error != null && chatState.messages.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(LucideIcons.wifiOff, color: DesignSystem.labelText(context), size: 48),
            const SizedBox(height: 12),
            Text('Could not load messages',
                style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 15)),
            const SizedBox(height: 16),
            TextButton(
              onPressed: () => ref.invalidate(chatStateProvider(widget.conversationId)),
              child: Text('Retry', style: TextStyle(color: DesignSystem.primary(context))),
            ),
          ],
        ),
      );
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
            Text('Say hello to ${widget.otherUser.name.split(' ').first}!',
                style: GoogleFonts.inter(
                    color: DesignSystem.labelText(context).withValues(alpha: 0.6),
                    fontSize: 13)),
          ],
        ),
      );
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: chatState.messages.length + (chatState.isLoading ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == 0 && chatState.isLoading) {
          return const Padding(
            padding: EdgeInsets.only(bottom: 8),
            child: Center(
              child: SizedBox(
                  width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
            ),
          );
        }
        final msgIndex = chatState.isLoading ? index - 1 : index;
        final msg = chatState.messages[msgIndex];
        final isMe = msg.senderId == currentUserId;
        final showDate = msgIndex == 0 ||
            !_isSameDay(chatState.messages[msgIndex - 1].createdAt, msg.createdAt);
        final isFirstInGroup = msgIndex == 0 ||
            chatState.messages[msgIndex - 1].senderId != msg.senderId ||
            showDate;
        final isLastInGroup = msgIndex == chatState.messages.length - 1 ||
            chatState.messages[msgIndex + 1].senderId != msg.senderId;

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

  Widget _buildMessageBubble(
      ChatMessage msg, bool isMe, bool isFirstInGroup, bool isLastInGroup) {
    final primaryColor = DesignSystem.primary(context);
    final timeStr = DateFormat('h:mm a').format(msg.createdAt);
    final isFile = msg.content.startsWith('Shared a file: ');

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
                backgroundImage: widget.otherUser.avatarUrl != null
                    ? NetworkImage(widget.otherUser.avatarUrl!)
                    : null,
                child: widget.otherUser.avatarUrl == null
                    ? Icon(LucideIcons.user, size: 12, color: DesignSystem.labelText(context))
                    : null,
              )
            else
              const SizedBox(width: 28),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: GestureDetector(
              onLongPress: () => _showMessageOptions(context, msg),
              child: Column(
                crossAxisAlignment:
                    isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                children: [
                  Container(
                    constraints:
                        BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.72),
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
                    child: isFile
                        ? _buildFileContent(msg.content.substring(15), isMe)
                        : Text(
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
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(timeStr,
                              style: GoogleFonts.inter(
                                  color: DesignSystem.labelText(context), fontSize: 10)),
                          if (isMe) ...[
                            const SizedBox(width: 3),
                            Icon(
                              msg.isPending
                                  ? LucideIcons.clock
                                  : (msg.isRead ? LucideIcons.checkCheck : LucideIcons.check),
                              color: msg.isRead ? Colors.blue : DesignSystem.labelText(context),
                              size: 11,
                            ),
                          ],
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),
          if (isMe) const SizedBox(width: 4),
        ],
      ),
    );
  }

  Widget _buildFileContent(String url, bool isMe) {
    final isImage = url.toLowerCase().endsWith('.jpg') ||
        url.toLowerCase().endsWith('.png') ||
        url.toLowerCase().endsWith('.jpeg') ||
        url.toLowerCase().endsWith('.gif');
    if (isImage) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(10),
        child: Image.network(url,
            fit: BoxFit.cover,
            width: 200,
            errorBuilder: (_, __, ___) => const Icon(LucideIcons.imageOff, size: 40)),
      );
    }
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(LucideIcons.file,
            color: isMe ? Colors.white : DesignSystem.primary(context), size: 20),
        const SizedBox(width: 8),
        Flexible(
          child: Text(url.split('/').last,
              style: TextStyle(
                  color: isMe ? Colors.white : DesignSystem.mainText(context), fontSize: 13),
              overflow: TextOverflow.ellipsis),
        ),
      ],
    );
  }

  Widget _buildScrollToBottomButton() {
    return GestureDetector(
      onTap: _scrollToBottom,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: DesignSystem.surface(context),
          shape: BoxShape.circle,
          border: Border.all(color: DesignSystem.glassBorder(context)),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.15), blurRadius: 8)],
        ),
        child: Icon(LucideIcons.chevronDown, color: DesignSystem.mainText(context), size: 18),
      ),
    );
  }

  Widget _buildInputArea(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(12, 8, 12, MediaQuery.of(context).padding.bottom + 8),
      decoration: BoxDecoration(
        color: DesignSystem.themeBackground(context),
        border: Border(top: BorderSide(color: DesignSystem.glassBorder(context), width: 0.5)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          GestureDetector(
            onTap: _attachFile,
            child: Container(
              margin: const EdgeInsets.only(bottom: 4),
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(
                  color: DesignSystem.surface(context), shape: BoxShape.circle),
              child: Icon(LucideIcons.paperclip,
                  color: DesignSystem.labelText(context), size: 18),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Container(
              constraints: const BoxConstraints(maxHeight: 120),
              decoration: BoxDecoration(
                color: DesignSystem.surface(context),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: DesignSystem.glassBorder(context)),
              ),
              child: TextField(
                controller: _controller,
                focusNode: _focusNode,
                onChanged: _onTextChanged,
                style: GoogleFonts.inter(color: DesignSystem.mainText(context), fontSize: 14),
                maxLines: null,
                textCapitalization: TextCapitalization.sentences,
                decoration: InputDecoration(
                  hintText: 'Message...',
                  hintStyle: GoogleFonts.inter(
                      color: DesignSystem.labelText(context), fontSize: 14),
                  border: InputBorder.none,
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                ),
                onSubmitted: (_) => _sendMessage(),
              ),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: _isComposing ? _sendMessage : null,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.only(bottom: 2),
              padding: const EdgeInsets.all(11),
              decoration: BoxDecoration(
                color: _isComposing
                    ? DesignSystem.primary(context)
                    : DesignSystem.surface(context),
                shape: BoxShape.circle,
              ),
              child: Icon(
                LucideIcons.send,
                color: _isComposing
                    ? (Theme.of(context).brightness == Brightness.dark
                        ? Colors.black
                        : Colors.white)
                    : DesignSystem.labelText(context),
                size: 18,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showMessageOptions(BuildContext context, ChatMessage msg) {
    HapticFeedback.mediumImpact();
    showModalBottomSheet(
      context: context,
      backgroundColor: DesignSystem.surface(context),
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 36,
              height: 4,
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              decoration: BoxDecoration(
                  color: DesignSystem.glassBorder(context),
                  borderRadius: BorderRadius.circular(2)),
            ),
            ListTile(
              leading: Icon(LucideIcons.copy, color: DesignSystem.mainText(context)),
              title: Text('Copy',
                  style: GoogleFonts.inter(color: DesignSystem.mainText(context))),
              onTap: () {
                Clipboard.setData(ClipboardData(text: msg.content));
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                    content: Text('Copied'), duration: Duration(seconds: 1)));
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  bool _isSameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _typingTimer?.cancel();
    _controller.dispose();
    _scrollController.dispose();
    _focusNode.dispose();
    super.dispose();
  }
}
