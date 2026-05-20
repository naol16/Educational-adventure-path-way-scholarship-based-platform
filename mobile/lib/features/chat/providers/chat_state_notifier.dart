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
  final int currentPage;
  final String? error;

  const ChatState({
    this.messages = const [],
    this.isLoading = false,
    this.isTyping = false,
    this.isSending = false,
    this.hasMore = true,
    this.currentPage = 1,
    this.error,
  });

  ChatState copyWith({
    List<ChatMessage>? messages,
    bool? isLoading,
    bool? isTyping,
    bool? isSending,
    bool? hasMore,
    int? currentPage,
    String? error,
  }) {
    return ChatState(
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      isTyping: isTyping ?? this.isTyping,
      isSending: isSending ?? this.isSending,
      hasMore: hasMore ?? this.hasMore,
      currentPage: currentPage ?? this.currentPage,
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
  StreamSubscription? _editSub;
  StreamSubscription? _deleteSub;
  StreamSubscription? _readSub;

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
      final messages =
          await _chatService.getMessages(conversationId, page: 1, limit: _pageSize);
      state = state.copyWith(
        messages: messages,
        isLoading: false,
        hasMore: messages.length >= _pageSize,
        currentPage: 1,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Failed to load messages');
      return;
    }

    await _socketService.connect();
    _socketService.joinConversation(conversationId);

    // Incoming messages from other users
    _messageSub = _socketService.messageStream.listen((data) {
      final msgConvId = data['conversationId'] ?? data['conversation_id'];
      if (msgConvId == conversationId) {
        try {
          final incoming = ChatMessage.fromJson(Map<String, dynamic>.from(data));
          if (incoming.senderId == currentUserId) return;
          final exists = state.messages.any((m) => m.id == incoming.id);
          if (!exists) {
            state = state.copyWith(messages: [...state.messages, incoming]);
          }
        } catch (_) {}
      }
    });

    // Typing indicator
    _typingSub = _socketService.typingStream.listen((data) {
      final msgConvId = data['conversationId'] ?? data['conversation_id'];
      if (msgConvId == conversationId) {
        state = state.copyWith(isTyping: data['isTyping'] == true);
      }
    });

    // Message edited
    _editSub = _socketService.editStream.listen((data) {
      final msgConvId = data['conversationId'] ?? data['conversation_id'];
      if (msgConvId == conversationId) {
        final msgId = data['messageId'];
        final newContent = data['content'] as String?;
        if (msgId != null && newContent != null) {
          state = state.copyWith(
            messages: state.messages
                .map((m) => m.id == msgId
                    ? m.copyWith(content: newContent, isEdited: true)
                    : m)
                .toList(),
          );
        }
      }
    });

    // Message deleted
    _deleteSub = _socketService.deleteStream.listen((data) {
      final msgConvId = data['conversationId'] ?? data['conversation_id'];
      if (msgConvId == conversationId) {
        final msgId = data['messageId'];
        if (msgId != null) {
          state = state.copyWith(
            messages: state.messages.where((m) => m.id != msgId).toList(),
          );
        }
      }
    });

    // Read receipts
    _readSub = _socketService.readStream.listen((data) {
      final msgConvId = data['conversationId'] ?? data['conversation_id'];
      if (msgConvId == conversationId) {
        final readerId = data['readerId'];
        if (readerId != null && readerId != currentUserId) {
          state = state.copyWith(
            messages: state.messages
                .map((m) =>
                    m.senderId == currentUserId ? m.copyWith(isRead: true) : m)
                .toList(),
          );
        }
      }
    });
  }

  /// Load older messages (pagination — prepend to list)
  Future<void> loadMore() async {
    if (!state.hasMore || state.isLoading) return;
    state = state.copyWith(isLoading: true);
    try {
      final nextPage = state.currentPage + 1;
      final older = await _chatService.getMessages(
        conversationId,
        page: nextPage,
        limit: _pageSize,
      );
      state = state.copyWith(
        messages: [...older, ...state.messages],
        isLoading: false,
        hasMore: older.length >= _pageSize,
        currentPage: nextPage,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }

  /// Send with optimistic UI
  Future<void> sendMessage(String content, {int? replyToId}) async {
    if (content.trim().isEmpty) return;

    final tempId = -DateTime.now().millisecondsSinceEpoch;
    final optimistic = ChatMessage(
      id: tempId,
      conversationId: conversationId,
      senderId: currentUserId,
      content: content.trim(),
      isRead: false,
      createdAt: DateTime.now(),
      isPending: true,
      replyToId: replyToId,
    );
    state = state.copyWith(messages: [...state.messages, optimistic]);

    final saved = await _chatService.sendMessage(
      conversationId,
      content.trim(),
      replyToId: replyToId,
    );

    if (saved != null) {
      state = state.copyWith(
        messages: state.messages
            .map((m) => m.id == tempId ? saved : m)
            .toList(),
      );
    } else {
      // Mark as failed (keep visible, no pending spinner)
      state = state.copyWith(
        messages: state.messages
            .map((m) => m.id == tempId ? m.copyWith(isPending: false) : m)
            .toList(),
      );
    }
  }

  Future<void> editMessage(int messageId, String newContent) async {
    // Optimistic update
    state = state.copyWith(
      messages: state.messages
          .map((m) => m.id == messageId
              ? m.copyWith(content: newContent, isEdited: true)
              : m)
          .toList(),
    );
    await _chatService.editMessage(messageId, newContent);
  }

  Future<void> deleteMessage(int messageId) async {
    // Optimistic remove
    state = state.copyWith(
      messages: state.messages.where((m) => m.id != messageId).toList(),
    );
    await _chatService.deleteMessage(messageId);
  }

  void sendTyping(bool isTyping) {
    _socketService.sendTyping(conversationId, isTyping);
  }

  @override
  void dispose() {
    _messageSub?.cancel();
    _typingSub?.cancel();
    _editSub?.cancel();
    _deleteSub?.cancel();
    _readSub?.cancel();
    super.dispose();
  }
}

final chatStateProvider =
    StateNotifierProvider.family<ChatNotifier, ChatState, int>(
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
