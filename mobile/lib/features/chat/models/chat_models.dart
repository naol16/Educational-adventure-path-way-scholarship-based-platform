import 'package:mobile/models/user.dart';

class Conversation {
  final int id;
  final List<User> participants;
  final ChatMessage? lastMessage;
  final int unreadCount;
  final DateTime updatedAt;
  final bool isGroup;
  final String? name;
  final String? description;
  final String? country;
  final bool isJoined; // Used for group discovery

  Conversation({
    required this.id,
    required this.participants,
    this.lastMessage,
    this.unreadCount = 0,
    required this.updatedAt,
    this.isGroup = false,
    this.name,
    this.description,
    this.country,
    this.isJoined = true, // Default to true for existing convs
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    // Backend returns Users via Sequelize through-association (capital U)
    final rawUsers = json['Users'] ?? json['users'] ?? json['members'] ?? [];
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
      isGroup: json['isGroup'] ?? json['is_group'] ?? false,
      name: json['name'],
      description: json['description'],
      country: json['country'],
      isJoined: json['isJoined'] ?? true,
    );
  }

  User getOtherParticipant(int currentUserId) {
    if (participants.isEmpty) {
      return User(id: 0, name: name ?? 'Group', email: '', role: 'student', raw: const {});
    }
    // For groups, other participant might not be useful for title, but we keep logic
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
  final String? senderName;
  final String content;
  final bool isRead;
  final DateTime createdAt;
  final bool isPending; // optimistic UI flag

  ChatMessage({
    required this.id,
    required this.conversationId,
    required this.senderId,
    this.senderName,
    required this.content,
    required this.isRead,
    required this.createdAt,
    this.isPending = false,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    // Try to extract sender name from nested User object if available
    String? name;
    if (json['Sender'] != null) {
      name = json['Sender']['name'];
    } else if (json['sender'] != null) {
      name = json['sender']['name'];
    }

    return ChatMessage(
      id: json['id'] ?? 0,
      // Backend uses conversation_id (snake_case) or conversationId
      conversationId: json['conversationId'] ?? json['conversation_id'] ?? 0,
      senderId: json['senderId'] ?? json['sender_id'] ?? 0,
      senderName: name ?? json['senderName'] ?? json['sender_name'],
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
      senderName: senderName,
      content: content,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt,
      isPending: isPending ?? this.isPending,
    );
  }
}
