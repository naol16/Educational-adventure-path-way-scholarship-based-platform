import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/core/providers/notification_provider.dart';
import 'package:mobile/features/core/services/notification_api_service.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  String _activeTab = 'Account';

  final List<Map<String, dynamic>> _tabs = [
    {'title': 'Account', 'icon': LucideIcons.user},
    {'title': 'Security', 'icon': LucideIcons.shield},
    {'title': 'Appearance', 'icon': LucideIcons.palette},
    {'title': 'Billing', 'icon': LucideIcons.creditCard},
  ];

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).valueOrNull;

    return Scaffold(
      body: Stack(
        children: [
          // Background Blurs
          Positioned(
            top: -100,
            right: -100,
            child: DesignSystem.buildBlurCircle(DesignSystem.emerald.withOpacity(0.15), 300),
          ),
          Positioned(
            bottom: -50,
            left: -50,
            child: DesignSystem.buildBlurCircle(Colors.blue.withOpacity(0.1), 250),
          ),

          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(context),
                _buildTabSwitcher(),
                Expanded(
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 20),
                        _buildActiveContent(user),
                        const SizedBox(height: 40),
                        _buildLogoutButton(),
                        const SizedBox(height: 40),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => context.pop(),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withOpacity(0.1)),
              ),
              child: const Icon(LucideIcons.chevronLeft, color: Colors.white, size: 20),
            ),
          ),
          const SizedBox(width: 20),
          Text(
            "Settings",
            style: GoogleFonts.plusJakartaSans(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabSwitcher() {
    return Container(
      height: 60,
      margin: const EdgeInsets.only(bottom: 10),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 15),
        itemCount: _tabs.length,
        itemBuilder: (context, index) {
          final tab = _tabs[index];
          final isSelected = _activeTab == tab['title'];
          return GestureDetector(
            onTap: () => setState(() => _activeTab = tab['title']),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.symmetric(horizontal: 5, vertical: 10),
              padding: const EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(
                color: isSelected ? DesignSystem.emerald.withOpacity(0.15) : Colors.transparent,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected ? DesignSystem.emerald.withOpacity(0.5) : Colors.white.withOpacity(0.05),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    tab['icon'],
                    size: 16,
                    color: isSelected ? DesignSystem.emerald : Colors.white60,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    tab['title'],
                    style: GoogleFonts.inter(
                      color: isSelected ? DesignSystem.emerald : Colors.white60,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildActiveContent(user) {
    switch (_activeTab) {
      case 'Account':
        return _buildAccountSection(user);
      case 'Appearance':
        return _buildAppearanceSection();
      case 'Security':
        return _buildSecuritySection();
      case 'Billing':
        return _buildBillingSection();
      default:
        return Container();
    }
  }

  Widget _buildAccountSection(user) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle("Personal Profile", "Manage your account identity"),
        const SizedBox(height: 20),
        _buildSettingsItem(
          icon: LucideIcons.user,
          title: "Full Name",
          value: user?.name ?? "Loading...",
        ),
        _buildSettingsItem(
          icon: LucideIcons.mail,
          title: "Email Address",
          value: user?.email ?? "Loading...",
        ),
        _buildSettingsItem(
          icon: LucideIcons.briefcase,
          title: "Role",
          value: user?.role?.toUpperCase() ?? "STUDENT",
        ),
        _buildSettingsItem(
          icon: LucideIcons.bell,
          title: "Test Notification",
          value: "Trigger",
          onTap: () async {
            try {
              await ref.read(notificationApiServiceProvider).triggerTestNotification();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Test notification triggered!")),
              );
              // Small delay to allow backend to process
              Future.delayed(const Duration(seconds: 1), () {
                ref.read(notificationProvider.notifier).refresh();
              });
            } catch (e) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text("Error: $e")),
              );
            }
          },
        ),
      ],
    );
  }

  Widget _buildAppearanceSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle("Appearance", "Customize your visual experience"),
        const SizedBox(height: 20),
        _buildSettingsItem(
          icon: LucideIcons.moon,
          title: "Theme Mode",
          value: "Dark (Default)",
          onTap: () {},
        ),
        _buildSettingsItem(
          icon: LucideIcons.palette,
          title: "Accent Color",
          value: "Emerald Green",
          onTap: () {},
        ),
        _buildSettingsItem(
          icon: LucideIcons.type,
          title: "Typography",
          value: "Inter & Plus Jakarta",
          onTap: () {},
        ),
      ],
    );
  }

  Widget _buildSecuritySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle("Security", "Protect your credentials"),
        const SizedBox(height: 20),
        _buildSettingsItem(
          icon: LucideIcons.lock,
          title: "Change Password",
          value: "**********",
          onTap: () {},
        ),
        _buildSettingsItem(
          icon: LucideIcons.shieldCheck,
          title: "Two-Factor Auth",
          value: "Disabled",
          onTap: () {},
        ),
      ],
    );
  }

  Widget _buildBillingSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle("Billing", "Manage your subscription plan"),
        const SizedBox(height: 20),
        _buildSettingsItem(
          icon: LucideIcons.star,
          title: "Current Plan",
          value: "Free Tier",
          valueColor: DesignSystem.emerald,
        ),
        _buildSettingsItem(
          icon: LucideIcons.history,
          title: "Payment History",
          value: "No transactions",
          onTap: () {},
        ),
      ],
    );
  }

  Widget _buildSectionTitle(String title, String subtitle) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: GoogleFonts.plusJakartaSans(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          subtitle,
          style: GoogleFonts.inter(
            color: Colors.white54,
            fontSize: 13,
          ),
        ),
      ],
    );
  }

  Widget _buildSettingsItem({
    required IconData icon,
    required String title,
    required String value,
    Color? valueColor,
    VoidCallback? onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: ListTile(
        onTap: onTap,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: DesignSystem.emerald.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: DesignSystem.emerald, size: 18),
        ),
        title: Text(
          title,
          style: GoogleFonts.inter(
            color: Colors.white70,
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              value,
              style: GoogleFonts.inter(
                color: valueColor ?? Colors.white,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
            if (onTap != null) ...[
              const SizedBox(width: 8),
              const Icon(LucideIcons.chevronRight, color: Colors.white24, size: 16),
            ]
          ],
        ),
      ),
    );
  }

  Widget _buildLogoutButton() {
    return GestureDetector(
      onTap: () async {
        final confirmed = await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            backgroundColor: const Color(0xFF1E293B),
            title: Text("Logout", style: GoogleFonts.plusJakartaSans(color: Colors.white)),
            content: Text("Are you sure you want to log out?", style: GoogleFonts.inter(color: Colors.white70)),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text("Cancel"),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text("Logout", style: TextStyle(color: Colors.redAccent)),
              ),
            ],
          ),
        );

        if (confirmed == true) {
          await ref.read(authProvider.notifier).logout();
        }
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: Colors.redAccent.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.redAccent.withOpacity(0.2)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(LucideIcons.logOut, color: Colors.redAccent, size: 20),
            const SizedBox(width: 12),
            Text(
              "Log Out",
              style: GoogleFonts.plusJakartaSans(
                color: Colors.redAccent,
                fontWeight: FontWeight.w700,
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
