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
    // Backend returns Users via Sequelize through-association (capital U)
    final rawUsers = json['Users'] ?? json['users'] ?? [];
    final participants = <User>[];
    for (final u in (rawUsers as List)) {
      try {
        final map = Map<String, dynamic>.from(u);
        // Ensure required fields exist before parsing
        if (map['id'] != null) {
          participants.add(User.fromJson(map));
        }
      } catch (_) {}
    }

    // Backend returns ChatMessages array (newest first, limit 1)
    ChatMessage? lastMsg;
    final rawMsgs = json['ChatMessages'] ?? json['messages'] ?? [];
    if (json['lastMessage'] != null) {
      try {
        lastMsg = ChatMessage.fromJson(Map<String, dynamic>.from(json['lastMessage']));
      } catch (_) {}
    } else if ((rawMsgs as List).isNotEmpty) {
      try {
        lastMsg = ChatMessage.fromJson(Map<String, dynamic>.from(rawMsgs.first));
      } catch (_) {}
    }

    return Conversation(
      id: json['id'],
      participants: participants,
      lastMessage: lastMsg,
      unreadCount: int.tryParse(json['unreadCount']?.toString() ?? '0') ?? 0,
      updatedAt: DateTime.tryParse(json['updatedAt']?.toString() ?? '') ?? DateTime.now(),
    );
  }

  User getOtherParticipant(int currentUserId) {
    if (participants.isEmpty) {
      return User(id: 0, name: 'Unknown', email: '', role: 'student', raw: const {});
    }
    return participants.firstWhere(
      (u) => u.id != currentUserId,
      orElse: () => participants.first,
    );
  }
}

class ChatMessage {
  final int id;
  final int conversationId;
  final int senderId;
  final String content;
  final bool isRead;
  final DateTime createdAt;
  final bool isPending; // optimistic UI flag

  ChatMessage({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.content,
    required this.isRead,
    required this.createdAt,
    this.isPending = false,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] ?? 0,
      // Backend uses conversation_id (snake_case) or conversationId
      conversationId: json['conversationId'] ?? json['conversation_id'] ?? 0,
      senderId: json['senderId'] ?? json['sender_id'] ?? 0,
      content: json['content'] ?? '',
      isRead: json['isRead'] ?? json['is_read'] ?? false,
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
    );
  }

  ChatMessage copyWith({bool? isRead, bool? isPending, int? id}) {
    return ChatMessage(
      id: id ?? this.id,
      conversationId: conversationId,
      senderId: senderId,
      content: content,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt,
      isPending: isPending ?? this.isPending,
    );
  }
}
