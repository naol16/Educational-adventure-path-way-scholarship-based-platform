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
import 'package:mobile/features/chat/widgets/chat_info_bottom_sheet.dart';
import 'package:mobile/features/counselor/providers/counselor_providers.dart';
import 'package:mobile/features/counselor/widgets/propose_session_bottom_sheet.dart';
import 'package:mobile/features/mentors/providers/mentors_providers.dart';
import 'package:mobile/features/mentors/widgets/booking_bottom_sheet.dart';
import 'package:mobile/core/providers/dependencies.dart';
import 'package:mobile/models/user.dart';
import 'package:intl/intl.dart';
import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';

class MentorChatScreen extends ConsumerStatefulWidget {
  final int conversationId;
  final User otherUser;
  final bool isGroup;
  final String? groupName;

  const MentorChatScreen({
    super.key,
    required this.conversationId,
    required this.otherUser,
    this.isGroup = false,
    this.groupName,
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

  // Reply / Edit state
  ChatMessage? _replyingTo;
  ChatMessage? _editingMessage;

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
    setState(() {
      _isComposing = false;
    });
    _typingTimer?.cancel();
    ref.read(chatStateProvider(widget.conversationId).notifier).sendTyping(false);

    if (_editingMessage != null) {
      ref
          .read(chatStateProvider(widget.conversationId).notifier)
          .editMessage(_editingMessage!.id, text);
      setState(() => _editingMessage = null);
    } else {
      ref
          .read(chatStateProvider(widget.conversationId).notifier)
          .sendMessage(text, replyToId: _replyingTo?.id);
      setState(() => _replyingTo = null);
    }
    Future.microtask(_scrollToBottom);
  }

  void _attachFile() async {
    final result = await FilePicker.platform.pickFiles();
    if (result != null && result.files.single.path != null) {
      final url =
          await ref.read(chatServiceProvider).uploadFile(result.files.single.path!);
      if (url != null && mounted) {
        ref
            .read(chatStateProvider(widget.conversationId).notifier)
            .sendMessage('[Attached File]($url)');
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
                // Typing indicator overlay
                if (chatState.isTyping)
                  Positioned(
                    bottom: 8,
                    left: 16,
                    child: _buildTypingIndicator(),
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
      title: GestureDetector(
        onTap: _openChatInfoSheet,
        behavior: HitTestBehavior.opaque,
        child: Row(
          children: [
            Stack(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: DesignSystem.surfaceMediumColor(context),
                  backgroundImage: (!widget.isGroup && widget.otherUser.avatarUrl != null)
                      ? NetworkImage(widget.otherUser.avatarUrl!)
                      : null,
                  child: (widget.isGroup || widget.otherUser.avatarUrl == null)
                      ? Icon(
                          widget.isGroup ? LucideIcons.users : LucideIcons.user,
                          size: 18,
                          color: DesignSystem.labelText(context),
                        )
                      : null,
                ),
                if (!widget.isGroup)
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981),
                        shape: BoxShape.circle,
                        border: Border.all(
                            color: DesignSystem.themeBackground(context), width: 2),
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
                    widget.isGroup
                        ? (widget.groupName ?? 'Community Group')
                        : widget.otherUser.name,
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
                      isTyping ? 'typing...' : (widget.isGroup ? 'Community' : 'Online'),
                      key: ValueKey(isTyping),
                      style: GoogleFonts.inter(
                        color: isTyping
                            ? DesignSystem.primary(context)
                            : const Color(0xFF10B981),
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
      ),
      actions: _buildAppBarActions(context),
    );
  }

  List<Widget> _buildAppBarActions(BuildContext context) {
    final currentUser = ref.read(currentUserProvider);
    final actions = <Widget>[];

    // Show calendar/session action for DM chats between students and counselors
    if (!widget.isGroup && currentUser != null) {
      final isStudentToCounselor =
          currentUser.isStudent && widget.otherUser.isCounselor;
      final isCounselorToStudent =
          currentUser.isCounselor && widget.otherUser.isStudent;

      if (isStudentToCounselor || isCounselorToStudent) {
        actions.add(
          IconButton(
            icon: Icon(
              LucideIcons.calendarPlus,
              color: DesignSystem.primary(context),
              size: 22,
            ),
            tooltip: isStudentToCounselor ? 'Book Session' : 'Propose Session',
            onPressed: () => _handleCalendarAction(
              context,
              isStudentToCounselor: isStudentToCounselor,
            ),
          ),
        );
      }
    }

    // Info button
    actions.add(
      IconButton(
        icon: Icon(
          LucideIcons.info,
          color: DesignSystem.labelText(context),
          size: 20,
        ),
        tooltip: 'Info',
        onPressed: _openChatInfoSheet,
      ),
    );

    return actions;
  }

  void _openChatInfoSheet() {
    final conversation = Conversation(
      id: widget.conversationId,
      participants: [widget.otherUser],
      updatedAt: DateTime.now(),
      isGroup: widget.isGroup,
      name: widget.groupName,
    );

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ChatInfoBottomSheet(
        conversation: conversation,
        otherUser: widget.otherUser,
      ),
    );
  }

  Future<void> _handleCalendarAction(
    BuildContext context, {
    required bool isStudentToCounselor,
  }) async {
    if (isStudentToCounselor) {
      // Student wants to book a session with the counselor
      // Show loading while we fetch the counselor profile
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => const Center(child: CircularProgressIndicator()),
      );

      final counselor = await ref
          .read(counselorServiceProvider)
          .getCounselorById(widget.otherUser.id);

      if (mounted) Navigator.pop(context); // close loading

      if (counselor != null && mounted) {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (_) => BookingBottomSheet(
            counselorId: counselor.id,
            counselorName: counselor.name.isNotEmpty
                ? counselor.name
                : widget.otherUser.name,
          ),
        );
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Could not load counselor details.'),
            backgroundColor: DesignSystem.error(context),
          ),
        );
      }
    } else {
      // Counselor wants to propose a session to the student
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (_) => ProposeSessionBottomSheet(
          studentUserId: widget.otherUser.id,
          studentName: widget.otherUser.name,
        ),
      );
    }
  }

  Widget _buildTypingIndicator() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: DesignSystem.surface(context),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: DesignSystem.glassBorder(context)),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 8),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _TypingDot(delay: 0),
          const SizedBox(width: 4),
          _TypingDot(delay: 200),
          const SizedBox(width: 4),
          _TypingDot(delay: 400),
          const SizedBox(width: 8),
          Text(
            widget.isGroup ? 'Someone is typing…' : '${widget.otherUser.name.split(' ').first} is typing…',
            style: GoogleFonts.inter(
              color: DesignSystem.labelText(context),
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageList(ChatState chatState, int currentUserId) {
    if (chatState.isLoading && chatState.messages.isEmpty) {
      return Center(
          child: CircularProgressIndicator(color: DesignSystem.primary(context)));
    }
    if (chatState.error != null && chatState.messages.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(LucideIcons.wifiOff, color: DesignSystem.labelText(context), size: 48),
            const SizedBox(height: 12),
            Text('Could not load messages',
                style: GoogleFonts.inter(
                    color: DesignSystem.labelText(context), fontSize: 15)),
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
            Icon(LucideIcons.messageCircle,
                color: DesignSystem.labelText(context), size: 56),
            const SizedBox(height: 12),
            Text('No messages yet',
                style: GoogleFonts.plusJakartaSans(
                    color: DesignSystem.labelText(context),
                    fontSize: 16,
                    fontWeight: FontWeight.w600)),
            const SizedBox(height: 4),
            Text(
              'Say hello to ${widget.isGroup ? (widget.groupName ?? "the group") : widget.otherUser.name.split(" ").first}!',
              style: GoogleFonts.inter(
                  color: DesignSystem.labelText(context).withValues(alpha: 0.6),
                  fontSize: 13),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 80),
      itemCount: chatState.messages.length + (chatState.isLoading ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == 0 && chatState.isLoading) {
          return const Padding(
            padding: EdgeInsets.only(bottom: 8),
            child: Center(
              child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2)),
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
            _buildMessageBubble(msg, isMe, isFirstInGroup, isLastInGroup, currentUserId),
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
      label = DateFormat('MMMM d, yyyy').format(date);
    }
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        children: [
          Expanded(child: Divider(color: DesignSystem.glassBorder(context))),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: DesignSystem.surface(context),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: DesignSystem.glassBorder(context)),
              ),
              child: Text(label,
                  style: GoogleFonts.inter(
                      color: DesignSystem.labelText(context),
                      fontSize: 11,
                      fontWeight: FontWeight.w500)),
            ),
          ),
          Expanded(child: Divider(color: DesignSystem.glassBorder(context))),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage msg, bool isMe, bool isFirstInGroup,
      bool isLastInGroup, int currentUserId) {
    final primaryColor = DesignSystem.primary(context);
    final timeStr = DateFormat('HH:mm').format(msg.createdAt);

    final bubbleRadius = BorderRadius.only(
      topLeft: Radius.circular(isMe || !isFirstInGroup ? 18 : 4),
      topRight: Radius.circular(!isMe || !isFirstInGroup ? 18 : 4),
      bottomLeft: Radius.circular(isMe ? 18 : (isLastInGroup ? 4 : 18)),
      bottomRight: Radius.circular(!isMe ? 18 : (isLastInGroup ? 4 : 18)),
    );

    return Padding(
      padding: EdgeInsets.only(
          bottom: isLastInGroup ? 8 : 2, top: isFirstInGroup ? 4 : 0),
      child: Row(
        mainAxisAlignment:
            isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // Avatar for other user
          if (!isMe) ...[
            if (isLastInGroup)
              CircleAvatar(
                radius: 14,
                backgroundColor: DesignSystem.surfaceMediumColor(context),
                backgroundImage: (!widget.isGroup && widget.otherUser.avatarUrl != null)
                    ? NetworkImage(widget.otherUser.avatarUrl!)
                    : null,
                child: (widget.isGroup || widget.otherUser.avatarUrl == null)
                    ? Text(
                        (msg.senderName ?? widget.otherUser.name)
                            .substring(0, 1)
                            .toUpperCase(),
                        style: GoogleFonts.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: DesignSystem.labelText(context)),
                      )
                    : null,
              )
            else
              const SizedBox(width: 28),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: GestureDetector(
              onLongPress: () => _showMessageOptions(context, msg, isMe),
              child: Column(
                crossAxisAlignment:
                    isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                children: [
                  // Group sender name
                  if (widget.isGroup && !isMe && isFirstInGroup)
                    Padding(
                      padding: const EdgeInsets.only(left: 4, bottom: 4),
                      child: Text(
                        msg.senderName ?? 'Member',
                        style: GoogleFonts.inter(
                          color: DesignSystem.primary(context),
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  // Reply context
                  if (msg.repliedTo != null)
                    _buildReplyPreview(msg.repliedTo!, isMe),
                  // Bubble
                  Container(
                    constraints: BoxConstraints(
                        maxWidth: MediaQuery.of(context).size.width * 0.72),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: isMe
                          ? primaryColor
                          : DesignSystem.surface(context),
                      borderRadius: bubbleRadius,
                      boxShadow: isMe
                          ? [
                              BoxShadow(
                                  color: primaryColor.withValues(alpha: 0.25),
                                  blurRadius: 8,
                                  offset: const Offset(0, 3))
                            ]
                          : null,
                    ),
                    child: msg.isAttachment
                        ? _buildAttachmentContent(msg.attachmentUrl!, isMe)
                        : _buildTextContent(msg, isMe, timeStr),
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

  Widget _buildReplyPreview(ChatMessage replied, bool isMe) {
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      constraints:
          BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.72),
      decoration: BoxDecoration(
        color: isMe
            ? Colors.black.withValues(alpha: 0.15)
            : DesignSystem.surfaceMediumColor(context),
        borderRadius: BorderRadius.circular(10),
        border: Border(
          left: BorderSide(color: DesignSystem.primary(context), width: 3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            replied.senderName ?? 'User',
            style: GoogleFonts.inter(
              color: DesignSystem.primary(context),
              fontSize: 10,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            replied.isAttachment ? '📎 Attachment' : replied.content,
            style: GoogleFonts.inter(
              color: isMe
                  ? Colors.white.withValues(alpha: 0.7)
                  : DesignSystem.labelText(context),
              fontSize: 12,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildTextContent(ChatMessage msg, bool isMe, String timeStr) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isMe ? (isDark ? Colors.black : Colors.white) : DesignSystem.mainText(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(
          msg.content,
          style: GoogleFonts.inter(color: textColor, height: 1.45, fontSize: 14),
        ),
        const SizedBox(height: 4),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (msg.isEdited)
              Padding(
                padding: const EdgeInsets.only(right: 4),
                child: Text('edited',
                    style: GoogleFonts.inter(
                        color: textColor.withValues(alpha: 0.5),
                        fontSize: 9,
                        fontStyle: FontStyle.italic)),
              ),
            Text(timeStr,
                style: GoogleFonts.inter(
                    color: textColor.withValues(alpha: 0.6), fontSize: 10)),
            if (isMe) ...[
              const SizedBox(width: 4),
              _buildReadReceipt(msg, textColor),
            ],
          ],
        ),
      ],
    );
  }

  Widget _buildReadReceipt(ChatMessage msg, Color textColor) {
    if (msg.isPending) {
      return Icon(LucideIcons.clock, size: 11, color: textColor.withValues(alpha: 0.5));
    }
    if (msg.isRead) {
      return Icon(LucideIcons.checkCheck, size: 12, color: Colors.blue.shade300);
    }
    if (msg.isDelivered) {
      return Icon(LucideIcons.checkCheck, size: 12, color: textColor.withValues(alpha: 0.5));
    }
    return Icon(LucideIcons.check, size: 12, color: textColor.withValues(alpha: 0.5));
  }

  Widget _buildAttachmentContent(String url, bool isMe) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isMe ? (isDark ? Colors.black : Colors.white) : DesignSystem.mainText(context);
    final isImage = RegExp(r'\.(jpg|jpeg|png|gif|webp)$', caseSensitive: false).hasMatch(url);

    if (isImage) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(10),
        child: Image.network(url,
            fit: BoxFit.cover,
            width: 200,
            errorBuilder: (_, __, ___) =>
                Icon(LucideIcons.imageOff, size: 40, color: textColor)),
      );
    }

    final fileName = url.split('/').last;
    return GestureDetector(
      onTap: () async {
        final uri = Uri.parse(url);
        if (await canLaunchUrl(uri)) launchUrl(uri);
      },
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isMe
                  ? Colors.white.withValues(alpha: 0.2)
                  : DesignSystem.primary(context).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(LucideIcons.file,
                color: isMe ? textColor : DesignSystem.primary(context), size: 20),
          ),
          const SizedBox(width: 10),
          Flexible(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(fileName,
                    style: GoogleFonts.inter(
                        color: textColor,
                        fontSize: 13,
                        fontWeight: FontWeight.w600),
                    overflow: TextOverflow.ellipsis),
                Text('Tap to open',
                    style: GoogleFonts.inter(
                        color: textColor.withValues(alpha: 0.6), fontSize: 10)),
              ],
            ),
          ),
        ],
      ),
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
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.15), blurRadius: 8)
          ],
        ),
        child: Icon(LucideIcons.chevronDown,
            color: DesignSystem.mainText(context), size: 18),
      ),
    );
  }

  Widget _buildInputArea(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
          12, 8, 12, MediaQuery.of(context).padding.bottom + 8),
      decoration: BoxDecoration(
        color: DesignSystem.themeBackground(context),
        border: Border(
            top: BorderSide(
                color: DesignSystem.glassBorder(context), width: 0.5)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Reply banner
          if (_replyingTo != null) _buildReplyBanner(),
          // Edit banner
          if (_editingMessage != null) _buildEditBanner(),
          const SizedBox(height: 4),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              // Attach button
              GestureDetector(
                onTap: _attachFile,
                child: Container(
                  margin: const EdgeInsets.only(bottom: 4),
                  padding: const EdgeInsets.all(9),
                  decoration: BoxDecoration(
                      color: DesignSystem.surface(context),
                      shape: BoxShape.circle),
                  child: Icon(LucideIcons.paperclip,
                      color: DesignSystem.labelText(context), size: 18),
                ),
              ),
              const SizedBox(width: 8),
              // Text field
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
                    style: GoogleFonts.inter(
                        color: DesignSystem.mainText(context), fontSize: 14),
                    maxLines: null,
                    textCapitalization: TextCapitalization.sentences,
                    decoration: InputDecoration(
                      hintText: _editingMessage != null
                          ? 'Edit message…'
                          : 'Message…',
                      hintStyle: GoogleFonts.inter(
                          color: DesignSystem.labelText(context), fontSize: 14),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 10),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Send button
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
                    _editingMessage != null ? LucideIcons.check : LucideIcons.send,
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
        ],
      ),
    );
  }

  Widget _buildReplyBanner() {
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: DesignSystem.primary(context).withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border(
            left: BorderSide(color: DesignSystem.primary(context), width: 3)),
      ),
      child: Row(
        children: [
          Icon(LucideIcons.cornerUpLeft,
              size: 14, color: DesignSystem.primary(context)),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Replying to ${_replyingTo!.senderName ?? "User"}',
                  style: GoogleFonts.inter(
                      color: DesignSystem.primary(context),
                      fontSize: 10,
                      fontWeight: FontWeight.bold),
                ),
                Text(
                  _replyingTo!.isAttachment
                      ? '📎 Attachment'
                      : _replyingTo!.content,
                  style: GoogleFonts.inter(
                      color: DesignSystem.labelText(context), fontSize: 12),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => setState(() => _replyingTo = null),
            child: Icon(LucideIcons.x,
                size: 16, color: DesignSystem.labelText(context)),
          ),
        ],
      ),
    );
  }

  Widget _buildEditBanner() {
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: DesignSystem.primary(context).withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border(
            left: BorderSide(color: DesignSystem.primary(context), width: 3)),
      ),
      child: Row(
        children: [
          Icon(LucideIcons.pencil,
              size: 14, color: DesignSystem.primary(context)),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Editing message',
                    style: GoogleFonts.inter(
                        color: DesignSystem.primary(context),
                        fontSize: 10,
                        fontWeight: FontWeight.bold)),
                Text(
                  _editingMessage!.content,
                  style: GoogleFonts.inter(
                      color: DesignSystem.labelText(context), fontSize: 12),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () {
              setState(() => _editingMessage = null);
              _controller.clear();
            },
            child: Icon(LucideIcons.x,
                size: 16, color: DesignSystem.labelText(context)),
          ),
        ],
      ),
    );
  }

  void _showMessageOptions(BuildContext context, ChatMessage msg, bool isMe) {
    HapticFeedback.mediumImpact();
    showModalBottomSheet(
      context: context,
      backgroundColor: DesignSystem.surface(context),
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Drag handle
            Container(
              width: 36,
              height: 4,
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              decoration: BoxDecoration(
                  color: DesignSystem.glassBorder(context),
                  borderRadius: BorderRadius.circular(2)),
            ),
            // Reply — always available
            _OptionTile(
              icon: LucideIcons.cornerUpLeft,
              label: 'Reply',
              onTap: () {
                Navigator.pop(context);
                setState(() {
                  _replyingTo = msg;
                  _editingMessage = null;
                });
                _focusNode.requestFocus();
              },
            ),
            // Copy — always available
            _OptionTile(
              icon: LucideIcons.copy,
              label: 'Copy',
              onTap: () {
                Clipboard.setData(ClipboardData(text: msg.content));
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                    content: Text('Copied'),
                    duration: Duration(seconds: 1)));
              },
            ),
            // Edit — only own messages, not attachments
            if (isMe && !msg.isAttachment)
              _OptionTile(
                icon: LucideIcons.pencil,
                label: 'Edit',
                onTap: () {
                  Navigator.pop(context);
                  setState(() {
                    _editingMessage = msg;
                    _replyingTo = null;
                    _controller.text = msg.content;
                    _isComposing = true;
                  });
                  _focusNode.requestFocus();
                },
              ),
            // Delete — only own messages
            if (isMe)
              _OptionTile(
                icon: LucideIcons.trash2,
                label: 'Delete',
                isDestructive: true,
                onTap: () {
                  Navigator.pop(context);
                  _confirmDelete(context, msg.id);
                },
              ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  void _confirmDelete(BuildContext context, int messageId) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: DesignSystem.surface(context),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Delete Message?',
            style: GoogleFonts.plusJakartaSans(
                color: DesignSystem.mainText(context),
                fontWeight: FontWeight.bold)),
        content: Text(
            'This will remove the message for everyone.',
            style: GoogleFonts.inter(
                color: DesignSystem.labelText(context), fontSize: 13)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel',
                style: TextStyle(color: DesignSystem.labelText(context))),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              ref
                  .read(chatStateProvider(widget.conversationId).notifier)
                  .deleteMessage(messageId);
            },
            child: const Text('Delete',
                style: TextStyle(color: Colors.red)),
          ),
        ],
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

// ─── Helper widgets ──────────────────────────────────────────────────────────

class _OptionTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool isDestructive;

  const _OptionTile({
    required this.icon,
    required this.label,
    required this.onTap,
    this.isDestructive = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = isDestructive ? Colors.red : DesignSystem.mainText(context);
    return ListTile(
      leading: Icon(icon, color: color, size: 20),
      title: Text(label,
          style: GoogleFonts.inter(color: color, fontSize: 15)),
      onTap: onTap,
      dense: true,
    );
  }
}

class _TypingDot extends StatefulWidget {
  final int delay;
  const _TypingDot({required this.delay});

  @override
  State<_TypingDot> createState() => _TypingDotState();
}

class _TypingDotState extends State<_TypingDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 600))
      ..repeat(reverse: true);
    _anim = Tween(begin: 0.3, end: 1.0).animate(CurvedAnimation(
        parent: _ctrl, curve: Curves.easeInOut));
    Future.delayed(Duration(milliseconds: widget.delay), () {
      if (mounted) _ctrl.forward();
    });
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _anim,
      child: Container(
        width: 6,
        height: 6,
        decoration: BoxDecoration(
          color: DesignSystem.primary(context),
          shape: BoxShape.circle,
        ),
      ),
    );
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }
}
