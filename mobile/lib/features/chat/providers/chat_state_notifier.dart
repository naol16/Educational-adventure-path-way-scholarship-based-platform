import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/services/socket_service.dart';
import 'package:mobile/features/chat/models/chat_models.dart';
import 'package:mobile/features/chat/services/chat_service.dart';
import 'package:mobile/features/chat/providers/chat_providers.dart';
import 'package:mobile/core/providers/dependencies.dart';

class ChatState {
  final List<ChatMessage> messages;
  final bool isLoading;
  final bool isTyping;
  final bool isSending;
  final bool hasMore;
  final String? error;

  const ChatState({
    this.messages = const [],
    this.isLoading = false,
    this.isTyping = false,
    this.isSending = false,
    this.hasMore = true,
    this.error,
  });

  ChatState copyWith({
    List<ChatMessage>? messages,
    bool? isLoading,
    bool? isTyping,
    bool? isSending,
    bool? hasMore,
    String? error,
  }) {
    return ChatState(
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      isTyping: isTyping ?? this.isTyping,
      isSending: isSending ?? this.isSending,
      hasMore: hasMore ?? this.hasMore,
      error: error,
    );
  }
}

class ChatNotifier extends StateNotifier<ChatState> {
  final ChatService _chatService;
  final SocketService _socketService;
  final int conversationId;
  final int currentUserId;

  StreamSubscription? _messageSub;
  StreamSubscription? _typingSub;

  static const int _pageSize = 50;

  ChatNotifier(
    this._chatService,
    this._socketService,
    this.conversationId,
    this.currentUserId,
  ) : super(const ChatState(isLoading: true)) {
    _init();
  }

  Future<void> _init() async {
    try {
      final messages = await _chatService.getMessages(conversationId, limit: _pageSize);
      state = state.copyWith(
        messages: messages,
        isLoading: false,
        hasMore: messages.length >= _pageSize,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Failed to load messages');
      return;
    }

    // Connect socket and join room
    await _socketService.connect();
    _socketService.joinConversation(conversationId);

    // Listen for incoming messages via socket
    _messageSub = _socketService.messageStream.listen((data) {
      final msgConvId = data['conversationId'] ?? data['conversation_id'];
      if (msgConvId == conversationId) {
        try {
          final incoming = ChatMessage.fromJson(Map<String, dynamic>.from(data));
          // Only add messages from the OTHER user — our own messages are
          // already shown optimistically and confirmed via HTTP response.
          if (incoming.senderId == currentUserId) return;
          // Also guard against duplicates by real id
          final exists = state.messages.any((m) => m.id == incoming.id);
          if (!exists) {
            state = state.copyWith(messages: [...state.messages, incoming]);
          }
        } catch (_) {}
      }
    });

    // Listen for typing indicator
    _typingSub = _socketService.typingStream.listen((data) {
      final msgConvId = data['conversationId'] ?? data['conversation_id'];
      if (msgConvId == conversationId) {
        state = state.copyWith(isTyping: data['isTyping'] == true);
      }
    });
  }

  /// Load older messages (pagination)
  Future<void> loadMore() async {
    if (!state.hasMore || state.isLoading) return;
    state = state.copyWith(isLoading: true);
    try {
      final older = await _chatService.getMessages(
        conversationId,
        limit: _pageSize,
        offset: state.messages.length,
      );
      state = state.copyWith(
        messages: [...older, ...state.messages],
        isLoading: false,
        hasMore: older.length >= _pageSize,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }

  /// Send with optimistic UI — shows message instantly, persists via HTTP.
  Future<void> sendMessage(int receiverId, String content) async {
    if (content.trim().isEmpty) return;

    // 1. Show optimistic message immediately (instant feel)
    final tempId = -DateTime.now().millisecondsSinceEpoch;
    final optimistic = ChatMessage(
      id: tempId,
      conversationId: conversationId,
      senderId: currentUserId,
      content: content.trim(),
      isRead: false,
      createdAt: DateTime.now(),
      isPending: true,
    );
    state = state.copyWith(messages: [...state.messages, optimistic]);

    // 2. Persist via HTTP — the server will broadcast to the other user via socket.
    //    Do NOT also emit via socket: that causes the message to appear twice.
    final saved = await _chatService.sendMessage(receiverId, content.trim());

    if (saved != null) {
      // Replace optimistic bubble with the confirmed server message
      final updated = state.messages
          .map((m) => m.id == tempId ? saved : m)
          .toList();
      state = state.copyWith(messages: updated);
    } else {
      // HTTP failed — mark as failed but keep visible
      final updated = state.messages
          .map((m) => m.id == tempId ? m.copyWith(isPending: false) : m)
          .toList();
      state = state.copyWith(messages: updated);
    }
  }

  void sendTyping(bool isTyping) {
    _socketService.sendTyping(conversationId, isTyping);
  }

  @override
  void dispose() {
    _messageSub?.cancel();
    _typingSub?.cancel();
    super.dispose();
  }
}

final chatStateProvider = StateNotifierProvider.family<ChatNotifier, ChatState, int>(
  (ref, conversationId) {
    final chatService = ref.watch(chatServiceProvider);
    final socketService = ref.watch(socketServiceProvider);
    final currentUser = ref.watch(currentUserProvider);
    return ChatNotifier(
      chatService,
      socketService,
      conversationId,
      currentUser?.id ?? 0,
    );
  },
);
