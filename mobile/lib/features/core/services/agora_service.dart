import 'dart:async';
import 'package:agora_rtc_engine/agora_rtc_engine.dart';
import 'package:flutter/foundation.dart';
import 'package:permission_handler/permission_handler.dart';

class AgoraService {
  static const String appId = "5ef76d27b47942eeb8dbc338310e4876";

  late RtcEngine _engine;
  bool _isInitialized = false;

  Future<RtcEngine> initialize() async {
    if (_isInitialized) return _engine;

    // Request permissions
    await [Permission.microphone, Permission.camera].request();

    _engine = createAgoraRtcEngine();
    await _engine.initialize(const RtcEngineContext(
      appId: appId,
      channelProfile: ChannelProfileType.channelProfileCommunication,
    ));

    await _engine.enableVideo();
    await _engine.startPreview();

    _isInitialized = true;
    return _engine;
  }

  Future<void> joinChannel(String channelId, int uid, {String? token}) async {
    await _engine.joinChannel(
      token: token ?? "", // Using empty string for "Testing Mode" (No token required)
      channelId: channelId,
      uid: uid,
      options: const ChannelMediaOptions(
        clientRoleType: ClientRoleType.clientRoleBroadcaster,
        publishCameraTrack: true,
        publishMicrophoneTrack: true,
      ),
    );
  }

  Future<void> leaveChannel() async {
    if (!_isInitialized) return;
    await _engine.leaveChannel();
    await _engine.stopPreview();
  }

  Future<void> release() async {
    if (!_isInitialized) return;
    await _engine.release();
    _isInitialized = false;
  }
}
