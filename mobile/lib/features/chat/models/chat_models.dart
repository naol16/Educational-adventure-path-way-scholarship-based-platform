import 'package:mobile/models/user.dart';

class Conversation {
  final dynamic id; // int for real convs, String like "counselor-42" for discoverable
  final List<User> participants;
  final ChatMessage? lastMessage;
  final int unreadCount;
  final DateTime updatedAt;
  final bool isGroup;
  final String? name;
  final String? description;
  final String? country;
  final bool isJoined;

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
    this.isJoined = true,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    final rawUsers = json['Users'] ?? json['users'] ?? json['members'] ?? [];
    final participants = <User>[];
    for (final u in (rawUsers as List)) {
      try {
        final map = Map<String, dynamic>.from(u);
        if (map['id'] != null) participants.add(User.fromJson(map));
      } catch (_) {}
    }

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
    return participants.firstWhere(
      (u) => u.id != currentUserId,
      orElse: () => participants.first,
    );
  }

  int get numericId => id is int ? id as int : int.tryParse(id.toString()) ?? 0;
}

class ChatMessage {
  final int id;
  final int conversationId;
  final int senderId;
  final String? senderName;
  final String content;
  final bool isRead;
  final bool isDelivered;
  final bool isEdited;
  final DateTime createdAt;
  final bool isPending;
  // Reply-to support
  final int? replyToId;
  final ChatMessage? repliedTo;

  ChatMessage({
    required this.id,
    required this.conversationId,
    required this.senderId,
    this.senderName,
    required this.content,
    required this.isRead,
    this.isDelivered = false,
    this.isEdited = false,
    required this.createdAt,
    this.isPending = false,
    this.replyToId,
    this.repliedTo,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    String? name;
    if (json['Sender'] != null) {
      name = json['Sender']['name'];
    } else if (json['sender'] != null) {
      name = json['sender']['name'];
    }

    ChatMessage? repliedTo;
    if (json['repliedTo'] != null) {
      try {
        repliedTo = ChatMessage.fromJson(Map<String, dynamic>.from(json['repliedTo']));
      } catch (_) {}
    }

    return ChatMessage(
      id: json['id'] ?? 0,
      conversationId: json['conversationId'] ?? json['conversation_id'] ?? 0,
      senderId: json['senderId'] ?? json['sender_id'] ?? 0,
      senderName: name ?? json['senderName'] ?? json['sender_name'],
      content: json['content'] ?? '',
      isRead: json['isRead'] ?? json['is_read'] ?? false,
      isDelivered: json['isDelivered'] ?? json['is_delivered'] ?? false,
      isEdited: json['isEdited'] ?? json['is_edited'] ?? false,
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
      replyToId: json['replyToId'] ?? json['reply_to_id'],
      repliedTo: repliedTo,
    );
  }

  ChatMessage copyWith({
    bool? isRead,
    bool? isDelivered,
    bool? isEdited,
    bool? isPending,
    int? id,
    String? content,
  }) {
    return ChatMessage(
      id: id ?? this.id,
      conversationId: conversationId,
      senderId: senderId,
      senderName: senderName,
      content: content ?? this.content,
      isRead: isRead ?? this.isRead,
      isDelivered: isDelivered ?? this.isDelivered,
      isEdited: isEdited ?? this.isEdited,
      createdAt: createdAt,
      isPending: isPending ?? this.isPending,
      replyToId: replyToId,
      repliedTo: repliedTo,
    );
  }

  bool get isAttachment => content.startsWith('[Attached File](') && content.endsWith(')');

  String? get attachmentUrl {
    if (!isAttachment) return null;
    final match = RegExp(r'^\[Attached File\]\((.*?)\)$').firstMatch(content);
    return match?.group(1);
  }
}
