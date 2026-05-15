import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/chat/services/ai_chat_service.dart';
import 'package:uuid/uuid.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';

class PathfinderChatScreen extends ConsumerStatefulWidget {
  final String initialMessage;
  final int? scholarshipId;

  const PathfinderChatScreen({super.key, this.initialMessage = '', this.scholarshipId});

  @override
  ConsumerState<PathfinderChatScreen> createState() => _PathfinderChatScreenState();
}

class _PathfinderChatScreenState extends ConsumerState<PathfinderChatScreen> {
  final TextEditingController _controller = TextEditingController();
  final List<Map<String, dynamic>> _messages = [];
  bool _isLoading = false;
  String? _sessionId;
  final _storage = const FlutterSecureStorage();

  @override
  void initState() {
    super.initState();
    _initSession();
  }

  Future<void> _initSession() async {
    _sessionId = await _storage.read(key: 'ai_chat_session_id');
    if (_sessionId == null) {
      _sessionId = 'session_${const Uuid().v4()}';
      await _storage.write(key: 'ai_chat_session_id', value: _sessionId!);
    }

    await _loadHistory();

    if (widget.initialMessage.isNotEmpty && _messages.where((m) => m['role'] == 'user').isEmpty) {
      _sendMessage(widget.initialMessage);
    }
  }

  Future<void> _loadHistory() async {
    setState(() => _isLoading = true);
    final history = await ref.read(aiChatServiceProvider).getChatHistory(
      scholarshipId: widget.scholarshipId,
      sessionId: _sessionId!,
    );
    
    setState(() {
      if (history.isNotEmpty) {
        _messages.clear();
        _messages.addAll(history);
      } else {
        _messages.add({
          'role': 'assistant',
          'content': widget.scholarshipId != null 
              ? "Hi! I am Path Finder. What would you like to know about this scholarship?" 
              : "Hi! I am Path Finder. How can I help you with your educational journey today?",
        });
      }
      _isLoading = false;
    });
  }

  void _sendMessage(String text) async {
    if (text.trim().isEmpty || _isLoading) return;
    
    setState(() {
      _messages.add({'role': 'user', 'content': text});
      _controller.clear();
      _isLoading = true;
    });

    final response = await ref.read(aiChatServiceProvider).sendMessage(
      text,
      _sessionId!,
      scholarshipId: widget.scholarshipId,
    );

    setState(() {
      if (response != null) {
        _messages.add({
          'role': 'assistant',
          'content': response['content'],
        });
      } else {
        _messages.add({
          'role': 'assistant',
          'content': "Sorry, I am having trouble connecting right now.",
        });
      }
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      appBar: AppBar(
        title: Row(
          children: [
            Icon(LucideIcons.sparkles, color: DesignSystem.primary(context), size: 20),
            const SizedBox(width: 8),
            Text("Pathfinder AI", style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontWeight: FontWeight.bold)),
          ],
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(LucideIcons.chevronLeft, color: DesignSystem.mainText(context)),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Stack(
        children: [
          Positioned(
            top: 100,
            left: -50,
            child: DesignSystem.buildBlurCircle(DesignSystem.primary(context).withValues(alpha: 0.05), 300),
          ),
          Column(
            children: [
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(20),
                  itemCount: _messages.length,
                  itemBuilder: (context, index) {
                    final msg = _messages[index];
                    final isUser = msg['role'] == 'user';
                    return _buildMessageBubble(msg['content']!, isUser);
                  },
                ),
              ),
              if (_isLoading)
                Padding(
                  padding: const EdgeInsets.only(bottom: 20),
                  child: Center(child: CircularProgressIndicator(color: DesignSystem.primary(context))),
                ),
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
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        decoration: BoxDecoration(
          color: isUser ? primaryColor.withValues(alpha: 0.2) : DesignSystem.surface(context),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(20),
            topRight: const Radius.circular(20),
            bottomLeft: isUser ? const Radius.circular(20) : Radius.zero,
            bottomRight: isUser ? Radius.zero : const Radius.circular(20),
          ),
          border: Border.all(color: isUser ? primaryColor.withValues(alpha: 0.5) : DesignSystem.glassBorder(context)),
        ),
        child: Text(
          text,
          style: GoogleFonts.inter(color: DesignSystem.mainText(context), height: 1.4, fontSize: 14),
        ),
      ),
    );
  }

  Widget _buildInputArea() {
    return Container(
      padding: EdgeInsets.fromLTRB(20, 10, 20, MediaQuery.of(context).padding.bottom + 10),
      decoration: BoxDecoration(
        color: DesignSystem.themeBackground(context).withValues(alpha: 0.8),
        border: Border(top: BorderSide(color: DesignSystem.glassBorder(context))),
      ),
      child: Row(
        children: [
          Expanded(
            child: GlassContainer(
              borderRadius: 30,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: TextField(
                controller: _controller,
                style: GoogleFonts.inter(color: DesignSystem.mainText(context)),
                decoration: InputDecoration(
                  hintText: "Type your message...",
                  hintStyle: GoogleFonts.inter(color: DesignSystem.labelText(context)),
                  border: InputBorder.none,
                ),
                onSubmitted: _sendMessage,
              ),
            ),
          ),
          const SizedBox(width: 10),
          GestureDetector(
            onTap: () => _sendMessage(_controller.text),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: DesignSystem.primary(context),
              ),
              child: const Icon(LucideIcons.send, color: Colors.black, size: 20),
            ),
          ),
        ],
      ),
    );
  }
}
