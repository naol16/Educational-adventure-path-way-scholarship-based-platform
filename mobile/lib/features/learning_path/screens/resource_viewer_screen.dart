import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

enum ResourceType { video, pdf }

class ResourceViewerScreen extends StatefulWidget {
  final ResourceType type;
  final String title;
  final String url;

  const ResourceViewerScreen({
    super.key,
    required this.type,
    required this.title,
    required this.url,
  });

  @override
  State<ResourceViewerScreen> createState() => _ResourceViewerScreenState();
}

class _ResourceViewerScreenState extends State<ResourceViewerScreen> {
  YoutubePlayerController? _youtubeController;
  bool _hasYoutubeError = false;

  @override
  void initState() {
    super.initState();
    if (widget.type == ResourceType.video) {
      final videoId = YoutubePlayer.convertUrlToId(widget.url) ?? '';
      if (videoId.isNotEmpty) {
        _youtubeController = YoutubePlayerController(
          initialVideoId: videoId,
          flags: const YoutubePlayerFlags(
            autoPlay: true,
            mute: false,
            enableCaption: true,
          ),
        )..addListener(() {
          if (_youtubeController != null && 
              !_hasYoutubeError && 
              mounted) {
            setState(() {
              _hasYoutubeError = true;
            });
          }
        });
      }
    }
  }

  @override
  void dispose() {
    _youtubeController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black, // Dark background for viewing resources
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          widget.title,
          style: GoogleFonts.inter(color: Colors.white, fontSize: 16),
        ),
      ),
      body: Stack(
        children: [
          // Viewer content
          Center(
            child: _buildViewerContent(context),
          ),
          
          // Bottom control bar overlay - ONLY for PDF now, Youtube player has its own controls
          if (widget.type == ResourceType.pdf)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: ClipRRect(
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaY: 10, sigmaX: 10),
                  child: Container(
                    height: 80,
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.5),
                      border: Border(
                        top: BorderSide(
                          color: Colors.white.withValues(alpha: 0.1),
                          width: 1,
                        ),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildControlItem(LucideIcons.skipBack, "Previous"),
                        _buildControlItem(LucideIcons.zoomIn, "Zoom In", isMain: true),
                        _buildControlItem(LucideIcons.skipForward, "Next"),
                      ],
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildViewerContent(BuildContext context) {
    switch (widget.type) {
      case ResourceType.video:
        if (_youtubeController != null) {
          return Stack(
            children: [
              YoutubePlayer(
                controller: _youtubeController!,
                showVideoProgressIndicator: true,
                progressIndicatorColor: DesignSystem.emerald,
                progressColors: const ProgressBarColors(
                  playedColor: DesignSystem.emerald,
                  handleColor: Colors.white,
                ),
              ),
              if (_hasYoutubeError)
                _buildYoutubeErrorOverlay(),
            ],
          );
        } else {
          return Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(LucideIcons.alertCircle, size: 80, color: Colors.amber),
              const SizedBox(height: 16),
              Text(
                "Invalid Video URL",
                style: GoogleFonts.inter(color: Colors.white, fontSize: 18),
              ),
              const SizedBox(height: 8),
              Text(
                widget.url,
                style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.5), fontSize: 12),
                textAlign: TextAlign.center,
              ),
            ],
          );
        }
      case ResourceType.pdf:
        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(LucideIcons.fileText, size: 80, color: Colors.white),
            const SizedBox(height: 16),
            Text(
              "Embedded PDF Viewer",
              style: GoogleFonts.inter(color: Colors.white, fontSize: 18),
            ),
            const SizedBox(height: 8),
            Text(
              widget.url,
              style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.5), fontSize: 12),
              textAlign: TextAlign.center,
            ),
          ],
        );
    }
  }

  Widget _buildControlItem(IconData icon, String label, {bool isMain = false}) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          icon,
          color: isMain ? DesignSystem.emerald : Colors.white,
          size: isMain ? 32 : 24,
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: GoogleFonts.inter(
            color: isMain ? DesignSystem.emerald : Colors.white.withValues(alpha: 0.7),
            fontSize: 10,
          ),
        ),
      ],
    );
  }

  Widget _buildYoutubeErrorOverlay() {
    return Positioned.fill(
      child: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            color: Colors.black.withValues(alpha: 0.7),
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: SingleChildScrollView(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    LucideIcons.playCircle,
                    color: DesignSystem.emerald,
                    size: 40,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    "Playback Restricted",
                    style: GoogleFonts.plusJakartaSans(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "This video's owner has restricted embedding. Tap below to watch directly on YouTube.",
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(
                      color: Colors.white70,
                      fontSize: 12,
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: _launchYoutube,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: DesignSystem.emerald,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(LucideIcons.externalLink, size: 16),
                        const SizedBox(width: 8),
                        Text(
                          "Watch on YouTube",
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _launchYoutube() async {
    final uri = Uri.parse(widget.url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }
}
