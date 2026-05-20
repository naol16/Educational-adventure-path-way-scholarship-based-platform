import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/core/providers/dependencies.dart';
import 'package:mobile/core/constants/api_config.dart';
import 'package:http/http.dart' as http;

class PathfinderChatScreen extends ConsumerStatefulWidget {
  final String initialMessage;
  final int? scholarshipId;

  const PathfinderChatScreen({
    super.key,
    this.initialMessage = '',
    this.scholarshipId,
  });

  @override
  ConsumerState<PathfinderChatScreen> createState() =>
      _PathfinderChatScreenState();
}

class _PathfinderChatScreenState extends ConsumerState<PathfinderChatScreen> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<Map<String, String>> _messages = [];
  bool _isLoading = false;
  String? _sessionId;

  @override
  void initState() {
    super.initState();
    _initSession();
  }

  Future<void> _initSession() async {
    // Reuse or create a session ID (mirrors website localStorage logic)
    final tokenStorage = ref.read(tokenStorageProvider);
    String? session = await tokenStorage.readSessionId();
    if (session == null || session.isEmpty) {
      session =
          'session_${DateTime.now().millisecondsSinceEpoch}_${(1000 + (DateTime.now().microsecond % 9000))}';
      await tokenStorage.writeSessionId(session);
    }
    _sessionId = session;

    // Load chat history from backend
    await _fetchHistory();

    // If an initial message was passed (e.g. from scholarship page), send it
    if (widget.initialMessage.isNotEmpty) {
      _controller.text = widget.initialMessage;
      _sendMessage(widget.initialMessage);
    }
  }

  Future<void> _fetchHistory() async {
    try {
      final tokenStorage = ref.read(tokenStorageProvider);
      final accessToken = await tokenStorage.readAccessToken();

      String url =
          '${ApiConfig.baseUrl}/api/ai-chat/history?sessionId=$_sessionId';
      if (widget.scholarshipId != null) {
        url += '&scholarshipId=${widget.scholarshipId}';
      }

      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $accessToken',
          'Accept': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is List && data.isNotEmpty) {
          setState(() {
            _messages.clear();
            for (final msg in data) {
              _messages.add({
                'role': msg['role']?.toString() ?? 'assistant',
                'text': msg['content']?.toString() ?? '',
              });
            }
          });
          _scrollToBottom();
          return;
        }
      }
    } catch (_) {}

    // No history — show welcome message
    setState(() {
      _messages.add({
        'role': 'ai',
        'text': widget.scholarshipId != null
            ? 'Hi! I am Path Finder. What would you like to know about this scholarship?'
            : 'Hi! I am Path Finder, your AI scholarship assistant. How can I help you accelerate your journey today?',
      });
    });
  }

  Future<void> _sendMessage(String text) async {
    if (text.trim().isEmpty || _isLoading) return;

    setState(() {
      _messages.add({'role': 'user', 'text': text.trim()});
      _controller.clear();
      _isLoading = true;
    });
    _scrollToBottom();

    try {
      final tokenStorage = ref.read(tokenStorageProvider);
      final accessToken = await tokenStorage.readAccessToken();

      final endpoint = widget.scholarshipId != null
          ? '${ApiConfig.baseUrl}/api/ai-chat/scholarship/${widget.scholarshipId}'
          : '${ApiConfig.baseUrl}/api/ai-chat/general';

      final response = await http.post(
        Uri.parse(endpoint),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $accessToken',
          'Accept': 'application/json',
        },
        body: jsonEncode({
          'message': text.trim(),
          'sessionId': _sessionId,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final content = data['content']?.toString() ??
            data['message']?.toString() ??
            'I could not process that request.';
        setState(() {
          _messages.add({'role': 'ai', 'text': content});
        });
      } else {
        final errData = jsonDecode(response.body);
        final errMsg = errData['error']?.toString() ?? 'Something went wrong.';
        setState(() {
          _messages.add({'role': 'ai', 'text': 'Error: $errMsg'});
        });
      }
    } catch (_) {
      setState(() {
        _messages.add({
          'role': 'ai',
          'text': 'Sorry, I am having trouble connecting right now. Please try again.',
        });
      });
    } finally {
      setState(() => _isLoading = false);
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      appBar: AppBar(
        title: Row(
          children: [
            Icon(LucideIcons.compass,
                color: DesignSystem.primary(context), size: 20),
            const SizedBox(width: 8),
            Text(
              'Path Finder',
              style: GoogleFonts.plusJakartaSans(
                color: DesignSystem.mainText(context),
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(LucideIcons.chevronLeft,
              color: DesignSystem.mainText(context)),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Stack(
        children: [
          Positioned(
            top: 100,
            left: -50,
            child: DesignSystem.buildBlurCircle(
              DesignSystem.primary(context).withValues(alpha: 0.05),
              300,
            ),
          ),
          Column(
            children: [
              Expanded(
                child: ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(20),
                  itemCount: _messages.length,
                  itemBuilder: (context, index) {
                    final msg = _messages[index];
                    final isUser = msg['role'] == 'user';
                    return _buildMessageBubble(msg['text']!, isUser);
                  },
                ),
              ),
              if (_isLoading) _buildTypingIndicator(),
              _buildInputArea(),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(String text, bool isUser) {
    final primaryColor = DesignSystem.primary(context);
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 15),
        padding: const EdgeInsets.all(16),
        constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.75),
        decoration: BoxDecoration(
          color: isUser
              ? primaryColor.withValues(alpha: 0.2)
              : DesignSystem.surface(context),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(20),
            topRight: const Radius.circular(20),
            bottomLeft:
                isUser ? const Radius.circular(20) : Radius.zero,
            bottomRight:
                isUser ? Radius.zero : const Radius.circular(20),
          ),
          border: Border.all(
            color: isUser
                ? primaryColor.withValues(alpha: 0.5)
                : DesignSystem.glassBorder(context),
          ),
        ),
        child: Text(
          text,
          style: GoogleFonts.inter(
            color: DesignSystem.mainText(context),
            height: 1.4,
            fontSize: 14,
          ),
        ),
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Padding(
      padding: const EdgeInsets.only(left: 20, bottom: 8),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Container(
          padding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: DesignSystem.surface(context),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: DesignSystem.glassBorder(context)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: DesignSystem.primary(context),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'Path Finder is thinking…',
                style: GoogleFonts.inter(
                  color: DesignSystem.labelText(context),
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInputArea() {
    return Container(
      padding: EdgeInsets.fromLTRB(
          20, 10, 20, MediaQuery.of(context).padding.bottom + 10),
      decoration: BoxDecoration(
        color: DesignSystem.themeBackground(context).withValues(alpha: 0.8),
        border:
            Border(top: BorderSide(color: DesignSystem.glassBorder(context))),
      ),
      child: Row(
        children: [
          Expanded(
            child: GlassContainer(
              borderRadius: 30,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: TextField(
                controller: _controller,
                style:
                    GoogleFonts.inter(color: DesignSystem.mainText(context)),
                decoration: InputDecoration(
                  hintText: 'Ask Path Finder…',
                  hintStyle: GoogleFonts.inter(
                      color: DesignSystem.labelText(context)),
                  border: InputBorder.none,
                ),
                onSubmitted: _sendMessage,
                enabled: !_isLoading,
              ),
            ),
          ),
          const SizedBox(width: 10),
          GestureDetector(
            onTap: _isLoading ? null : () => _sendMessage(_controller.text),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _isLoading
                    ? DesignSystem.primary(context).withValues(alpha: 0.4)
                    : DesignSystem.primary(context),
              ),
              child: const Icon(LucideIcons.send,
                  color: Colors.black, size: 20),
            ),
          ),
        ],
      ),
    );
  }
}
