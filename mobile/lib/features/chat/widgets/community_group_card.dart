import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/chat/models/chat_models.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';

/// Compact community group card — tapping opens the group chat preview.
class CommunityGroupCard extends StatelessWidget {
  final Conversation group;
  final VoidCallback? onTap;

  const CommunityGroupCard({
    super.key,
    required this.group,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GestureDetector(
        onTap: onTap,
        child: GlassContainer(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              // Group avatar
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: DesignSystem.primary(context).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(
                  LucideIcons.users,
                  color: DesignSystem.primary(context),
                  size: 22,
                ),
              ),
              const SizedBox(width: 14),

              // Group info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Name row
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            group.name ?? 'Untitled Group',
                            style: GoogleFonts.plusJakartaSans(
                              color: DesignSystem.mainText(context),
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (group.isJoined) ...[
                          const SizedBox(width: 6),
                          Icon(LucideIcons.checkCircle, size: 14, color: DesignSystem.emerald),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    // Location & members row
                    Row(
                      children: [
                        Icon(LucideIcons.globe, size: 12, color: DesignSystem.primary(context)),
                        const SizedBox(width: 4),
                        Text(
                          group.country ?? 'Global',
                          style: GoogleFonts.inter(
                            color: DesignSystem.primary(context),
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Icon(LucideIcons.users, size: 12, color: DesignSystem.labelText(context)),
                        const SizedBox(width: 4),
                        Text(
                          '${group.participants.length} members',
                          style: GoogleFonts.inter(
                            color: DesignSystem.labelText(context),
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Chevron
              Icon(LucideIcons.chevronRight, color: DesignSystem.labelText(context), size: 18),
            ],
          ),
        ),
      ),
    );
  }
}
