import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';

class VerificationWaitingScreen extends ConsumerStatefulWidget {
  const VerificationWaitingScreen({super.key});

  @override
  ConsumerState<VerificationWaitingScreen> createState() => _VerificationWaitingScreenState();
}

class _VerificationWaitingScreenState extends ConsumerState<VerificationWaitingScreen> {
  bool _refreshing = false;

  Future<void> _refreshStatus() async {
    setState(() => _refreshing = true);
    try {
      await ref.read(authProvider.notifier).refreshProfile();
    } finally {
      if (mounted) setState(() => _refreshing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).valueOrNull;

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: Stack(
        children: [
          // Background Glows
          Positioned(
            top: -100,
            right: -100,
            child: DesignSystem.buildBlurCircle(
              DesignSystem.primary(context).withValues(alpha: 0.1),
              400,
            ),
          ),
          Positioned(
            bottom: -50,
            left: -100,
            child: DesignSystem.buildBlurCircle(
              const Color(0xFF2563EB).withValues(alpha: 0.08),
              350,
            ),
          ),

          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Spacer(),
                  
                  // Animated Icon
                  TweenAnimationBuilder<double>(
                    tween: Tween(begin: 0.0, end: 1.0),
                    duration: const Duration(seconds: 1),
                    builder: (context, value, child) {
                      return Transform.scale(
                        scale: value,
                        child: child,
                      );
                    },
                    child: Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        color: DesignSystem.primary(context).withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: DesignSystem.primary(context).withValues(alpha: 0.2),
                          width: 2,
                        ),
                      ),
                      child: Icon(
                        LucideIcons.userCheck,
                        size: 48,
                        color: DesignSystem.primary(context),
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 40),
                  
                  Text(
                    "Verification in Progress",
                    textAlign: TextAlign.center,
                    style: DesignSystem.headingStyle(buildContext: context, fontSize: 28),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  Text(
                    "Hello ${user?.name ?? 'Counselor'},\nYour account application is currently being reviewed by our administration team. This usually takes 24-48 hours.",
                    textAlign: TextAlign.center,
                    style: DesignSystem.bodyStyle(
                      buildContext: context,
                      fontSize: 16,
                      color: DesignSystem.subText(context),
                    ),
                  ),
                  
                  const SizedBox(height: 40),
                  
                  GlassContainer(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.orange.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(LucideIcons.clock, color: Colors.orange, size: 20),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    "Current Status",
                                    style: DesignSystem.labelStyle(buildContext: context),
                                  ),
                                  Text(
                                    "Awaiting Admin Review",
                                    style: DesignSystem.bodyStyle(
                                      buildContext: context,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  
                  const Spacer(),
                  
                  PrimaryButton(
                    text: "Refresh Status",
                    isLoading: _refreshing,
                    onPressed: _refreshStatus,
                  ),
                  
                  const SizedBox(height: 16),
                  
                  TextButton.icon(
                    onPressed: () => ref.read(authProvider.notifier).logout(),
                    icon: const Icon(LucideIcons.logOut, size: 18),
                    label: const Text("Sign Out"),
                    style: TextButton.styleFrom(
                      foregroundColor: Colors.red.shade400,
                    ),
                  ),
                  
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
