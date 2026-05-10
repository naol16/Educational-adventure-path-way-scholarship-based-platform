import 'package:jitsi_meet_flutter_sdk/jitsi_meet_flutter_sdk.dart';
import 'package:mobile/models/models.dart';

class MeetingService {
  static final _jitsiMeet = JitsiMeet();

  static Future<void> joinMeeting({
    required String roomName,
    required User user,
    required String counselorName,
    Function()? onClosed,
  }) async {
    final displayName = user.name ?? (user.role == 'student' ? 'Student' : 'Counselor');
    final avatarUrl = user.avatarUrl;

    var options = JitsiMeetConferenceOptions(
      serverURL: "https://meet.jit.si",
      room: roomName,
      configOverrides: {
        "startWithAudioMuted": false,
        "startWithVideoMuted": false,
        "subject" : "Counseling Session: $counselorName",
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

    var listener = JitsiMeetEventListener(
      readyToClose: () {
        if (onClosed != null) {
          onClosed();
        }
      },
      conferenceTerminated: (url, error) {
        if (onClosed != null) {
          onClosed();
        }
      },
    );

    await _jitsiMeet.join(options, listener);
  }
}
