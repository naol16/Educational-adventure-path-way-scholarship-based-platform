import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:pdfx/pdfx.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';

class DocumentPreviewDialog extends StatefulWidget {
  final File? file;
  final String? url;
  final String title;

  const DocumentPreviewDialog({
    super.key,
    this.file,
    this.url,
    required this.title,
  }) : assert(file != null || url != null);

  @override
  State<DocumentPreviewDialog> createState() => _DocumentPreviewDialogState();

  static void show(BuildContext context, {File? file, String? url, required String title}) {
    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'Document Preview',
      pageBuilder: (context, _, __) => DocumentPreviewDialog(file: file, url: url, title: title),
    );
  }
}

class _DocumentPreviewDialogState extends State<DocumentPreviewDialog> {
  PdfControllerPinch? _pdfController;
  bool _isLoading = true;
  String? _error;
  bool _isImage = false;

  @override
  void initState() {
    super.initState();
    _initPreview();
  }

  Future<void> _initPreview() async {
    final path = widget.file?.path ?? widget.url!;
    final isPdf = path.toLowerCase().endsWith('.pdf');
    _isImage = !isPdf;

    if (isPdf) {
      try {
        String filePath;
        if (widget.file != null) {
          filePath = widget.file!.path;
        } else {
          final response = await http.get(Uri.parse(widget.url!));
          if (response.statusCode == 200) {
            final dir = await getTemporaryDirectory();
            final file = File('${dir.path}/temp_preview_${DateTime.now().millisecondsSinceEpoch}.pdf');
            await file.writeAsBytes(response.bodyBytes);
            filePath = file.path;
          } else {
            throw 'Failed to download document';
          }
        }
        
        if (mounted) {
          setState(() {
            _pdfController = PdfControllerPinch(
              document: PdfDocument.openFile(filePath),
            );
            _isLoading = false;
          });
        }
      } catch (e) {
        if (mounted) {
          setState(() {
            _error = e.toString();
            _isLoading = false;
          });
        }
      }
    } else {
      if (mounted) {
        setState(() => _isLoading = false);
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
      backgroundColor: Colors.black.withValues(alpha: 0.9),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(widget.title, style: GoogleFonts.plusJakartaSans(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(LucideIcons.x, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Center(
        child: _isLoading
            ? const CircularProgressIndicator(color: DesignSystem.emerald)
            : _error != null
                ? _buildError()
                : _isImage
                    ? _buildImagePreview()
                    : _buildPdfPreview(),
      ),
    );
  }

  Widget _buildError() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(LucideIcons.alertCircle, color: Colors.red, size: 48),
        const SizedBox(height: 16),
        Text('Preview Failed', style: GoogleFonts.plusJakartaSans(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Text(_error!, style: GoogleFonts.inter(color: Colors.white70, fontSize: 14), textAlign: TextAlign.center),
      ],
    );
  }

  Widget _buildImagePreview() {
    return InteractiveViewer(
      child: widget.file != null 
          ? Image.file(widget.file!) 
          : Image.network(widget.url!, loadingBuilder: (context, child, loadingProgress) {
              if (loadingProgress == null) return child;
              return const CircularProgressIndicator(color: DesignSystem.emerald);
            }),
    );
  }

  Widget _buildPdfPreview() {
    return PdfViewPinch(controller: _pdfController!);
  }
}
