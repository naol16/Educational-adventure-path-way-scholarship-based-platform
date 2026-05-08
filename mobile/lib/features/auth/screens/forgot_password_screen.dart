import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/custom_text_field.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:mobile/models/models.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _emailController = TextEditingController();
  bool _loading = false;
  String? _error;
  bool _success = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _resetPassword() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      setState(() => _error = 'Email is required');
      return;
    }
    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email)) {
      setState(() => _error = 'Please enter a valid email');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      await ref.read(authProvider.notifier).forgotPassword(email);
      if (mounted) {
        setState(() {
          _loading = false;
          _success = true;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _loading = false;
          _error = e is ApiException ? e.message : 'Failed to send reset link';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Theme(
      data: ThemeData.light(),
      child: Builder(
        builder: (context) {
          return Scaffold(
            backgroundColor: DesignSystem.themeBackground(context),
            body: Stack(
              children: [
                // Background Glows
                Positioned(
                  top: -50,
                  right: -100,
                  child: DesignSystem.buildBlurCircle(
                    DesignSystem.primary(context).withValues(alpha: 0.08),
                    300,
                  ),
                ),
                
                SafeArea(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 20),
                        GestureDetector(
                          onTap: () => context.pop(),
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: DesignSystem.glassBackground(context),
                              shape: BoxShape.circle,
                              border: Border.all(color: DesignSystem.glassBorder(context)),
                            ),
                            child: Icon(LucideIcons.chevronLeft, color: DesignSystem.mainText(context), size: 20),
                          ),
                        ),
                        const SizedBox(height: 40),
                        
                        Text("Reset Password", style: DesignSystem.headingStyle(buildContext: context)),
                        const SizedBox(height: 12),
                        Text(
                          "Enter your email and we'll send you instructions to reset your password.",
                          style: DesignSystem.bodyStyle(buildContext: context, fontSize: 16),
                        ),
                        const SizedBox(height: 40),
                        
                        if (_success)
                          _buildSuccessCard()
                        else
                          GlassContainer(
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text("Email Address", style: DesignSystem.labelStyle(buildContext: context)),
                                const SizedBox(height: 12),
                                CustomTextField(
                                  hintText: "Enter your email",
                                  prefixIcon: LucideIcons.mail,
                                  controller: _emailController,
                                  keyboardType: TextInputType.emailAddress,
                                  hasError: _error != null,
                                  errorText: _error,
                                ),
                                const SizedBox(height: 24),
                                PrimaryButton(
                                  text: "Send Instructions",
                                  isLoading: _loading,
                                  onPressed: _resetPassword,
                                ),
                              ],
                            ),
                          ),
                        
                        const SizedBox(height: 40),
                        Center(
                          child: TextButton(
                            onPressed: () => context.pop(),
                            child: Text(
                              "Back to Login",
                              style: DesignSystem.bodyStyle(
                                buildContext: context,
                                color: DesignSystem.primary(context),
                              ).copyWith(fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        }
      ),
    );
  }

  Widget _buildSuccessCard() {
    return GlassContainer(
      padding: const EdgeInsets.all(32),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.green.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(LucideIcons.checkCircle2, color: Colors.green, size: 48),
          ),
          const SizedBox(height: 24),
          Text(
            "Check your Email",
            style: DesignSystem.headingStyle(buildContext: context, fontSize: 20),
          ),
          const SizedBox(height: 12),
          Text(
            "We have sent a password recovery link to ${_emailController.text}",
            textAlign: TextAlign.center,
            style: DesignSystem.bodyStyle(buildContext: context),
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: TextButton(
              onPressed: () => setState(() => _success = false),
              child: Text(
                "Try another email",
                style: DesignSystem.labelStyle(buildContext: context),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
