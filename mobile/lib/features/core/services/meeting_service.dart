import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:jitsi_meet_flutter_sdk/jitsi_meet_flutter_sdk.dart';
import 'package:mobile/models/models.dart';
import 'package:url_launcher/url_launcher.dart';

class MeetingService {
  static final _jitsiMeet = JitsiMeet();

  static Future<void> joinMeeting({
    required String roomName,
    required User user,
    required String counselorName,
    Function()? onClosed,
  }) async {
    // ── Web platform ─────────────────────────────────────────────────────────
    // jitsi_meet_flutter_sdk has NO web support (native SDK wrapper only).
    // On web we open the Jitsi room URL directly in the browser tab.
    if (kIsWeb) {
      final displayName = Uri.encodeComponent(
        user.name ?? (user.role == 'student' ? 'Student' : 'Counselor'),
      );
      final uri = Uri.parse(
        'https://meet.jit.si/$roomName#userInfo.displayName="$displayName"',
      );
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
      // No native listener on web – fire onClosed immediately
      if (onClosed != null) onClosed();
      return;
    }

    // ── Native (Android / iOS) path ──────────────────────────────────────────
    final displayName =
        user.name ?? (user.role == 'student' ? 'Student' : 'Counselor');
    final avatarUrl = user.avatarUrl;

    final options = JitsiMeetConferenceOptions(
      serverURL: "https://meet.jit.si",
      room: roomName,
      configOverrides: {
        "startWithAudioMuted": false,
        "startWithVideoMuted": false,
        "subject": "Counseling Session: $counselorName",
      },
      featureFlags: {
        "invite.enabled": false,
        "live-streaming.enabled": false,
        "recording.enabled": false,
      },
      userInfo: JitsiMeetUserInfo(
        displayName: displayName,
        email: user.email,
        avatar: avatarUrl,
      ),
    );

    final listener = JitsiMeetEventListener(
      readyToClose: () {
        if (onClosed != null) onClosed();
      },
      conferenceTerminated: (url, error) {
        if (onClosed != null) onClosed();
      },
    );

    await _jitsiMeet.join(options, listener);
  }
}
