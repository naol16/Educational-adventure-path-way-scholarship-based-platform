import 'package:intl/intl.dart';

enum NotificationType {
  scholarshipMatch('SCHOLARSHIP_MATCH'),
  booking('booking'),
  payment('payment'),
  system('system'),
  unknown('unknown');

  final String value;
  const NotificationType(this.value);

  static NotificationType fromString(String value) {
    return NotificationType.values.firstWhere(
      (e) => e.value.toLowerCase() == value.toLowerCase(),
      orElse: () => NotificationType.unknown,
    );
  }
}

class NotificationModel {
  final int id;
  final int userId;
  final String title;
  final String message;
  final NotificationType type;
  final int? relatedId;
  final bool isRead;
  final bool isClicked;
  final DateTime createdAt;

  NotificationModel({
    required this.id,
    required this.userId,
    required this.title,
    required this.message,
    required this.type,
    this.relatedId,
    required this.isRead,
    required this.isClicked,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'],
      userId: json['userId'],
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      type: NotificationType.fromString(json['type'] ?? ''),
      relatedId: json['relatedId'],
      isRead: json['isRead'] ?? false,
      isClicked: json['isClicked'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(createdAt);

    if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return DateFormat('MMM d').format(createdAt);
    }
  }
}
