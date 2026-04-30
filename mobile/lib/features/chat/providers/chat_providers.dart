import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/providers/dependencies.dart';
import 'package:mobile/features/chat/models/chat_models.dart';
import 'package:mobile/features/chat/services/chat_service.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';

final chatServiceProvider = Provider<ChatService>((ref) {
  return ChatService(ref.watch(apiClientProvider));
});

final conversationsProvider = FutureProvider<List<Conversation>>((ref) async {
  return ref.watch(chatServiceProvider).getConversations();
});

final messagesProvider = FutureProvider.family<List<ChatMessage>, int>((ref, conversationId) async {
  return ref.watch(chatServiceProvider).getMessages(conversationId);
});

final currentUserProvider = Provider((ref) {
  return ref.watch(authProvider).valueOrNull;
});
