import 'package:mobile/models/user.dart';

class Conversation {
  final int id;
  final List<User> participants;
  final ChatMessage? lastMessage;
  final int unreadCount;
  final DateTime updatedAt;

  Conversation({
    required this.id,
    required this.participants,
    this.lastMessage,
    this.unreadCount = 0,
    required this.updatedAt,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    // Backend returns 'messages' array (Sequelize association), not 'lastMessage'
    ChatMessage? lastMsg;
    if (json['lastMessage'] != null) {
      lastMsg = ChatMessage.fromJson(json['lastMessage']);
    } else if (json['messages'] != null && (json['messages'] as List).isNotEmpty) {
      lastMsg = ChatMessage.fromJson((json['messages'] as List).first);
    } else if (json['ChatMessages'] != null && (json['ChatMessages'] as List).isNotEmpty) {
      lastMsg = ChatMessage.fromJson((json['ChatMessages'] as List).first);
    }

    return Conversation(
      id: json['id'],
      participants: (json['users'] as List?)?.map((u) => User.fromJson(u)).toList() ?? [],
      lastMessage: lastMsg,
      unreadCount: int.tryParse(json['unreadCount']?.toString() ?? '0') ?? 0,
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  User getOtherParticipant(int currentUserId) {
    return participants.firstWhere((u) => u.id != currentUserId, orElse: () => participants.first);
  }
}

class ChatMessage {
  final int id;
  final int conversationId;
  final int senderId;
  final String content;
  final bool isRead;
  final DateTime createdAt;

  ChatMessage({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.content,
    required this.isRead,
    required this.createdAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'],
      conversationId: json['conversationId'],
      senderId: json['senderId'],
      content: json['content'],
      isRead: json['isRead'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
