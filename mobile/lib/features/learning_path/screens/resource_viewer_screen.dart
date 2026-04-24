import 'dart:ui';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:pdfx/pdfx.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';

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
  PdfControllerPinch? _pdfController;
  bool _isPdfLoading = true;
  String? _pdfError;

  @override
  void initState() {
    super.initState();
    if (widget.type == ResourceType.pdf) {
      _loadPdf();
    }
  }

  Future<void> _loadPdf() async {
    try {
      final response = await http.get(Uri.parse(widget.url));
      if (response.statusCode == 200) {
        final bytes = response.bodyBytes;
        final dir = await getTemporaryDirectory();
        final filename = widget.url.split('/').last;
        final file = File('${dir.path}/$filename');
        await file.writeAsBytes(bytes);
        
        if (mounted) {
          setState(() {
            _pdfController = PdfControllerPinch(
              document: PdfDocument.openFile(file.path),
            );
            _isPdfLoading = false;
          });
        }
      } else {
        throw "Failed to download PDF (Status: ${response.statusCode})";
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _pdfError = e.toString();
          _isPdfLoading = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _pdfController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
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
          Center(
            child: _buildViewerContent(context),
          ),
          
          if (widget.type == ResourceType.pdf && !_isPdfLoading && _pdfError == null)
            _buildPdfControls(),
        ],
      ),
    );
  }

  Widget _buildPdfControls() {
    return Positioned(
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
                GestureDetector(
                  onTap: () => _pdfController?.previousPage(
                    duration: const Duration(milliseconds: 250),
                    curve: Curves.easeInOut,
                  ),
                  child: _buildControlItem(LucideIcons.skipBack, "Previous"),
                ),
                _buildControlItem(LucideIcons.zoomIn, "Pinch to Zoom", isMain: true),
                GestureDetector(
                  onTap: () => _pdfController?.nextPage(
                    duration: const Duration(milliseconds: 250),
                    curve: Curves.easeInOut,
                  ),
                  child: _buildControlItem(LucideIcons.skipForward, "Next"),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildViewerContent(BuildContext context) {
    switch (widget.type) {
      case ResourceType.video:
        return _buildExternalVideoOverlay();
        
      case ResourceType.pdf:
        if (_isPdfLoading) {
          return Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const CircularProgressIndicator(color: DesignSystem.emerald),
              const SizedBox(height: 24),
              Text(
                "Downloading Briefing...",
                style: GoogleFonts.inter(color: Colors.white70),
              ),
            ],
          );
        }
        if (_pdfError != null) {
          return _buildErrorState("Failed to load PDF", _pdfError!, LucideIcons.fileX);
        }
        return PdfViewPinch(
          controller: _pdfController!,
        );
    }
  }

  Widget _buildErrorState(String title, String message, IconData icon) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(icon, size: 80, color: Colors.amber),
        const SizedBox(height: 16),
        Text(
          title,
          style: GoogleFonts.inter(color: Colors.white, fontSize: 18),
        ),
        const SizedBox(height: 8),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 40),
          child: Text(
            message,
            style: GoogleFonts.inter(color: Colors.white.withValues(alpha: 0.5), fontSize: 12),
            textAlign: TextAlign.center,
          ),
        ),
      ],
    );
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

  Widget _buildExternalVideoOverlay() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: DesignSystem.emerald.withValues(alpha: 0.1),
            ),
            child: const Icon(
              LucideIcons.playCircle,
              color: DesignSystem.emerald,
              size: 50,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            "Video Lesson",
            style: GoogleFonts.plusJakartaSans(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            "This lesson is hosted securely on YouTube. Tap below to watch it instantly in the official app for the best experience.",
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              color: Colors.white70,
              fontSize: 14,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: _launchYoutube,
            style: ElevatedButton.styleFrom(
              backgroundColor: DesignSystem.emerald,
              foregroundColor: Colors.black,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 0,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(LucideIcons.externalLink, size: 20),
                const SizedBox(width: 12),
                Text(
                  "Watch on YouTube",
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
        ],
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
