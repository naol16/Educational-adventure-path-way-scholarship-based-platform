import 'package:flutter/material.dart';
import 'package:mobile/models/models.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:mobile/features/core/screens/agora_video_call_screen.dart';

class MeetingService {
  static Future<void> joinMeeting({
    required BuildContext context, // Added context for navigation
    required String roomName,
    required User user,
    required String counselorName,
    Function()? onClosed,
  }) async {
    // ── Native & Web path using Agora ────────────────────────────────────────
    // Sanitize room name for Agora (must be alphanumeric and within 64 chars)
    final sanitizedRoom = roomName.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '');
    
    // Agora requires a unique UID for each user in the channel. 
    final uid = user.id ?? DateTime.now().millisecondsSinceEpoch % 1000000;

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => AgoraVideoCallScreen(
          roomName: sanitizedRoom,
          userName: user.name ?? 'User',
          userId: uid,
        ),
      ),
    ).then((_) {
      if (onClosed != null) onClosed();
    });
  }
}
