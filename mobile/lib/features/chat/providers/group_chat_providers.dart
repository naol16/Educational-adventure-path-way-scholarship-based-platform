import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/chat/models/chat_models.dart';
import 'package:mobile/features/chat/providers/chat_providers.dart';

/// Fetches available community groups.
final availableGroupsProvider = FutureProvider<List<Conversation>>((ref) async {
  final chatService = ref.watch(chatServiceProvider);
  return chatService.getGroupConversations();
});

/// Notifier to manage group actions (join/leave).
class GroupChatNotifier extends StateNotifier<AsyncValue<void>> {
  final Ref _ref;

  GroupChatNotifier(this._ref) : super(const AsyncData(null));

  Future<bool> joinGroup(int groupId) async {
    state = const AsyncLoading();
    final chatService = _ref.read(chatServiceProvider);
    final success = await chatService.joinGroup(groupId);

    if (success) {
      state = const AsyncData(null);
      _ref.invalidate(availableGroupsProvider);
      _ref.invalidate(conversationsProvider);
    } else {
      state = AsyncError('Failed to join group', StackTrace.current);
    }
    return success;
  }

  Future<bool> leaveGroup(int groupId) async {
    state = const AsyncLoading();
    final chatService = _ref.read(chatServiceProvider);
    final success = await chatService.leaveGroup(groupId);

    if (success) {
      state = const AsyncData(null);
      _ref.invalidate(availableGroupsProvider);
      _ref.invalidate(conversationsProvider);
    } else {
      state = AsyncError('Failed to leave group', StackTrace.current);
    }
    return success;
  }
}

final groupChatActionProvider =
    StateNotifierProvider<GroupChatNotifier, AsyncValue<void>>((ref) {
  return GroupChatNotifier(ref);
});
