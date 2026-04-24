import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';

class IELTSRestrictedAudioPlayer extends StatefulWidget {
  final String? base64Audio;
  final String? url;

  const IELTSRestrictedAudioPlayer({
    super.key,
    this.base64Audio,
    this.url,
  });

  @override
  State<IELTSRestrictedAudioPlayer> createState() => _IELTSRestrictedAudioPlayerState();
}

class _IELTSRestrictedAudioPlayerState extends State<IELTSRestrictedAudioPlayer> {
  late AudioPlayer _player;
  bool _isPlaying = false;
  bool _hasPlayedOnce = false;
  Duration _duration = Duration.zero;
  Duration _position = Duration.zero;

  @override
  void initState() {
    super.initState();
    _player = AudioPlayer();
    _initAudio();
  }

  Future<void> _initAudio() async {
    try {
      if (widget.base64Audio != null) {
        final bytes = base64Decode(widget.base64Audio!);
        await _player.setAudioSource(MyCustomSource(bytes));
      } else if (widget.url != null) {
        await _player.setUrl(widget.url!);
      }

      _player.durationStream.listen((d) {
        if (mounted) setState(() => _duration = d ?? Duration.zero);
      });

      _player.positionStream.listen((p) {
        if (mounted) setState(() => _position = p);
      });

      _player.playerStateStream.listen((state) {
        if (mounted) {
          setState(() {
            _isPlaying = state.playing;
          });
          
          if (state.processingState == ProcessingState.completed) {
            setState(() {
              _hasPlayedOnce = true;
            });
          }
        }
      });
    } catch (e) {
      debugPrint("Error initializing audio: $e");
    }
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  void _togglePlay() {
    if (_hasPlayedOnce) return;

    if (_isPlaying) {
      _player.pause();
    } else {
      _player.play();
    }
  }

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        children: [
          Row(
            children: [
              IconButton(
                onPressed: _hasPlayedOnce ? null : _togglePlay,
                icon: Icon(
                  _hasPlayedOnce 
                    ? LucideIcons.lock 
                    : (_isPlaying ? LucideIcons.pauseCircle : LucideIcons.playCircle),
                  color: _hasPlayedOnce ? Colors.white24 : DesignSystem.primary(context),
                  size: 32,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  children: [
                    // In IELTS, seeking is not allowed. We show a non-interactive progress bar.
                    ClipRRect(
                      borderRadius: BorderRadius.circular(2),
                      child: LinearProgressIndicator(
                        value: _duration.inMilliseconds > 0 
                            ? _position.inMilliseconds / _duration.inMilliseconds 
                            : 0,
                        backgroundColor: DesignSystem.surface(context),
                        valueColor: AlwaysStoppedAnimation<Color>(
                          _hasPlayedOnce ? Colors.white10 : DesignSystem.primary(context)
                        ),
                        minHeight: 4,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            _formatDuration(_position),
                            style: DesignSystem.labelStyle(buildContext: context, fontSize: 10),
                          ),
                          Text(
                            _hasPlayedOnce ? "AUDIO FINISHED" : _formatDuration(_duration),
                            style: DesignSystem.labelStyle(
                              buildContext: context, 
                              fontSize: 10,
                              color: _hasPlayedOnce ? Colors.redAccent : null,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (_hasPlayedOnce)
            const Padding(
              padding: EdgeInsets.only(top: 8.0),
              child: Text(
                "Standard IELTS Rule: Audio can only be played once.",
                style: TextStyle(color: Colors.redAccent, fontSize: 10, fontWeight: FontWeight.bold),
              ),
            ),
        ],
      ),
    );
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, "0");
    String twoDigitMinutes = twoDigits(duration.inMinutes.remainder(60));
    String twoDigitSeconds = twoDigits(duration.inSeconds.remainder(60));
    return "$twoDigitMinutes:$twoDigitSeconds";
  }
}

// ignore: experimental_member_use
class MyCustomSource extends StreamAudioSource {
  final List<int> bytes;
  MyCustomSource(this.bytes);

  @override
  // ignore: experimental_member_use
  Future<StreamAudioResponse> request([int? start, int? end]) async {
    start ??= 0;
    end ??= bytes.length;
    // ignore: experimental_member_use
    return StreamAudioResponse(
      sourceLength: bytes.length,
      contentLength: end - start,
      offset: start,
      stream: Stream.value(bytes.sublist(start, end)),
      contentType: 'audio/mpeg',
    );
  }
}
