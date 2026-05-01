import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/core/theme/design_system.dart';

class PreFlightDialog extends StatefulWidget {
  final VoidCallback onComplete;

  const PreFlightDialog({super.key, required this.onComplete});

  static void show(BuildContext context, VoidCallback onComplete) {
    showDialog(
      context: context,
      barrierDismissible: false,
      barrierColor: Colors.black.withValues(alpha: 0.5),
      builder: (context) => PreFlightDialog(onComplete: onComplete),
    );
  }

  @override
  State<PreFlightDialog> createState() => _PreFlightDialogState();
}

class _PreFlightDialogState extends State<PreFlightDialog> {
  bool _cameraOk = false;
  bool _micOk = false;
  bool _checking = true;

  @override
  void initState() {
    super.initState();
    _checkPermissions();
  }

  Future<void> _checkPermissions() async {
    // Artificial delay to make it feel like a "pre-flight check"
    await Future.delayed(const Duration(milliseconds: 800));

    final cameraStatus = await Permission.camera.request();
    if (mounted) {
      setState(() {
        _cameraOk = cameraStatus.isGranted;
      });
    }

    await Future.delayed(const Duration(milliseconds: 800));

    final micStatus = await Permission.microphone.request();
    if (mounted) {
      setState(() {
        _micOk = micStatus.isGranted;
        _checking = false;
      });
    }

    if (_cameraOk && _micOk) {
      await Future.delayed(const Duration(seconds: 1));
      if (mounted) {
        Navigator.of(context).pop();
        widget.onComplete();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      elevation: 0,
      child: GlassContainer(
        padding: const EdgeInsets.all(32),
        borderRadius: 24,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: DesignSystem.primary(context).withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(LucideIcons.video, size: 48, color: DesignSystem.primary(context)),
            ),
            const SizedBox(height: 24),
            Text(
              "Pre-Flight Check",
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: DesignSystem.mainText(context),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              "Preparing your counseling session...",
              style: TextStyle(
                color: DesignSystem.labelText(context),
              ),
            ),
            const SizedBox(height: 32),
            _buildCheckItem("Camera", _cameraOk, _checking && !_cameraOk),
            const SizedBox(height: 16),
            _buildCheckItem("Microphone", _micOk, _checking && _cameraOk && !_micOk),
            const SizedBox(height: 32),
            if (!_checking && (!_cameraOk || !_micOk))
              ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red.shade500,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
                child: const Text("Cancel"),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildCheckItem(String label, bool isOk, bool isCheckingThis) {
    return Row(
      children: [
        if (isCheckingThis)
          SizedBox(
            width: 24,
            height: 24,
            child: CircularProgressIndicator(strokeWidth: 2, color: DesignSystem.primary(context)),
          )
        else
          Icon(
            isOk ? LucideIcons.checkCircle2 : LucideIcons.xCircle,
            color: isOk ? Colors.green.shade500 : Colors.red.shade500,
          ),
        const SizedBox(width: 16),
        Text(
          label,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: DesignSystem.mainText(context),
          ),
        ),
        const Spacer(),
        if (!isCheckingThis)
          Text(
            isOk ? "OK" : "Failed",
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: isOk ? Colors.green.shade500 : Colors.red.shade500,
            ),
          ),
      ],
    );
  }
}
