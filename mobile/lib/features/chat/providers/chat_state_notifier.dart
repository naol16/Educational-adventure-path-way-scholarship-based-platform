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

  ChatState({
    this.messages = const [],
    this.isLoading = false,
    this.isTyping = false,
  });

  ChatState copyWith({
    List<ChatMessage>? messages,
    bool? isLoading,
    bool? isTyping,
  }) {
    return ChatState(
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      isTyping: isTyping ?? this.isTyping,
    );
  }
}

class ChatNotifier extends StateNotifier<ChatState> {
  final ChatService _chatService;
  final SocketService _socketService;
  final int conversationId;
  StreamSubscription? _messageSub;
  StreamSubscription? _typingSub;

  ChatNotifier(this._chatService, this._socketService, this.conversationId)
      : super(ChatState(isLoading: true)) {
    _init();
  }

  Future<void> _init() async {
    // Load initial messages
    final messages = await _chatService.getMessages(conversationId);
    state = state.copyWith(messages: messages, isLoading: false);

    // Join room
    _socketService.joinConversation(conversationId);

    // Listen for new messages
    _messageSub = _socketService.messageStream.listen((data) {
      if (data['conversationId'] == conversationId) {
        final newMessage = ChatMessage.fromJson(data);
        state = state.copyWith(messages: [...state.messages, newMessage]);
      }
    });

    // Listen for typing
    _typingSub = _socketService.typingStream.listen((data) {
      if (data['conversationId'] == conversationId) {
        state = state.copyWith(isTyping: data['isTyping']);
      }
    });
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

final chatStateProvider = StateNotifierProvider.family<ChatNotifier, ChatState, int>((ref, conversationId) {
  final chatService = ref.watch(chatServiceProvider);
  final socketService = ref.watch(socketServiceProvider);
  return ChatNotifier(chatService, socketService, conversationId);
});
