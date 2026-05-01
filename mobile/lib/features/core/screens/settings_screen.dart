import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';

import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/core/providers/theme_provider.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  String _activeTab = 'Security';

  final List<Map<String, dynamic>> _tabs = [
    {'title': 'Security', 'icon': LucideIcons.shield},
    {'title': 'Appearance', 'icon': LucideIcons.palette},
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
            child: DesignSystem.buildBlurCircle(DesignSystem.emerald.withValues(alpha: 0.15), 300),
          ),
          Positioned(
            bottom: -50,
            left: -50,
            child: DesignSystem.buildBlurCircle(Colors.blue.withValues(alpha: 0.1), 250),
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
                        _buildActiveContent(),
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
                color: DesignSystem.surface(context),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: DesignSystem.surface(context).withValues(alpha: 0.2)),
              ),
              child: Icon(LucideIcons.chevronLeft, color: DesignSystem.mainText(context), size: 20),
            ),
          ),
          const SizedBox(width: 20),
          Text(
            "Settings",
            style: DesignSystem.headingStyle(buildContext: context, fontSize: 24),
          ),
        ],
      ),
    );
  }

  Widget _buildTabSwitcher() {
    final primaryColor = DesignSystem.primary(context);
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
                color: isSelected ? primaryColor.withValues(alpha: 0.15) : Colors.transparent,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected ? primaryColor.withValues(alpha: 0.5) : DesignSystem.glassBorder(context),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    tab['icon'],
                    size: 16,
                    color: isSelected ? primaryColor : DesignSystem.labelText(context),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    tab['title'],
                    style: GoogleFonts.inter(
                      color: isSelected ? primaryColor : DesignSystem.labelText(context),
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

  Widget _buildActiveContent() {
    switch (_activeTab) {
      case 'Appearance':
        return _buildAppearanceSection();
      case 'Security':
        return _buildSecuritySection();
      default:
        return Container();
    }
  }

  Widget _buildAppearanceSection() {
    final themeState = ref.watch(themeProvider);
    final themeNotifier = ref.read(themeProvider.notifier);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle("Appearance", "Customize your visual experience"),
        const SizedBox(height: 30),
        
        Text("THEME MODE", style: DesignSystem.labelStyle(buildContext: context)),
        const SizedBox(height: 15),
        Row(
          children: [
            _buildThemeOption(
              icon: LucideIcons.moon,
              label: "Dark",
              isSelected: themeState.themeMode == ThemeMode.dark,
              onTap: () => themeNotifier.setThemeMode(ThemeMode.dark),
            ),
            const SizedBox(width: 15),
            _buildThemeOption(
              icon: LucideIcons.sun,
              label: "Light",
              isSelected: themeState.themeMode == ThemeMode.light,
              onTap: () => themeNotifier.setThemeMode(ThemeMode.light),
            ),
          ],
        ),
        
        const SizedBox(height: 40),
        Text("ACCENT COLOR", style: DesignSystem.labelStyle(buildContext: context)),
        const SizedBox(height: 15),
        Wrap(
          spacing: 15, runSpacing: 15,
          children: DesignSystem.accentColors.map((color) {
            final isSelected = themeState.accentColor.value == color.value;
            return GestureDetector(
              onTap: () => themeNotifier.setAccentColor(color),
              child: Container(
                width: 50, height: 50,
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isSelected 
                      ? (Theme.of(context).brightness == Brightness.dark ? Colors.white : Colors.black) 
                      : Colors.transparent,
                    width: 3,
                  ),
                  boxShadow: [
                    if (isSelected)
                      BoxShadow(
                        color: color.withValues(alpha: 0.4),
                        blurRadius: 10,
                        spreadRadius: 2,
                      )
                  ],
                ),
                child: isSelected 
                  ? Icon(LucideIcons.check, color: Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white, size: 20)
                  : null,
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildThemeOption({
    required IconData icon,
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    final primaryColor = DesignSystem.primary(context);
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 20),
          decoration: BoxDecoration(
            color: isSelected ? primaryColor.withValues(alpha: 0.1) : DesignSystem.surface(context),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSelected ? primaryColor : DesignSystem.surface(context).withValues(alpha: 0.2),
              width: 2,
            ),
          ),
          child: Column(
            children: [
              Icon(icon, color: isSelected ? primaryColor : DesignSystem.labelText(context), size: 24),
              const SizedBox(height: 10),
              Text(
                label,
                style: GoogleFonts.plusJakartaSans(
                  color: isSelected ? DesignSystem.mainText(context) : DesignSystem.labelText(context),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
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


  Widget _buildSectionTitle(String title, String subtitle) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: DesignSystem.headingStyle(buildContext: context, fontSize: 20),
        ),
        const SizedBox(height: 4),
        Text(
          subtitle,
          style: DesignSystem.bodyStyle(buildContext: context, fontSize: 13),
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
        color: DesignSystem.surface(context),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: DesignSystem.surface(context).withValues(alpha: 0.2)),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: DesignSystem.primary(context).withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: DesignSystem.primary(context), size: 18),
              ),
              const SizedBox(width: 12),
              Text(
                title,
                style: DesignSystem.bodyStyle(buildContext: context, fontSize: 14),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  value,
                  textAlign: TextAlign.right,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(
                    color: valueColor ?? DesignSystem.mainText(context),
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              if (onTap != null) ...[
                const SizedBox(width: 8),
                Icon(LucideIcons.chevronRight, color: DesignSystem.labelText(context), size: 16),
              ]
            ],
          ),
        ),
      ),
    );
  }

}
