import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/chat/models/chat_models.dart';
import 'package:mobile/features/chat/providers/group_chat_providers.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';

class CommunityGroupCard extends ConsumerWidget {
  final Conversation group;
  final VoidCallback? onJoinSuccess;

  const CommunityGroupCard({
    super.key,
    required this.group,
    this.onJoinSuccess,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final actionState = ref.watch(groupChatActionProvider);
    final isLoading = actionState is AsyncLoading;

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: GlassContainer(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(LucideIcons.globe, size: 14, color: DesignSystem.primary(context)),
                          const SizedBox(width: 6),
                          Text(
                            group.country ?? 'Global Community',
                            style: GoogleFonts.plusJakartaSans(
                              color: DesignSystem.primary(context),
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        group.name ?? 'Untitled Group',
                        style: DesignSystem.headingStyle(
                          buildContext: context,
                          fontSize: 18,
                        ),
                      ),
                    ],
                  ),
                ),
                _buildParticipantCount(context),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              group.description ?? 'Connect with students sharing similar goals in this community.',
              style: DesignSystem.bodyStyle(
                buildContext: context,
                color: DesignSystem.labelText(context),
                fontSize: 13,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 20),
            _buildActionButton(context, ref, isLoading),
          ],
        ),
      ),
    );
  }

  Widget _buildParticipantCount(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: DesignSystem.surfaceMediumColor(context),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(LucideIcons.users, size: 12, color: DesignSystem.labelText(context)),
          const SizedBox(width: 4),
          Text(
            '${group.participants.length}',
            style: DesignSystem.labelStyle(buildContext: context, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(BuildContext context, WidgetRef ref, bool isLoading) {
    if (group.isJoined) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          border: Border.all(color: DesignSystem.emerald.withValues(alpha: 0.3)),
          borderRadius: BorderRadius.circular(15),
        ),
        child: Center(
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(LucideIcons.checkCircle, size: 16, color: DesignSystem.emerald),
              const SizedBox(width: 8),
              Text(
                'ALREADY JOINED',
                style: GoogleFonts.plusJakartaSans(
                  color: DesignSystem.emerald,
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return GestureDetector(
      onTap: isLoading ? null : () async {
        final success = await ref.read(groupChatActionProvider.notifier).joinGroup(group.id);
        if (success && onJoinSuccess != null) {
          onJoinSuccess!();
        }
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 15),
        decoration: BoxDecoration(
          gradient: DesignSystem.easyPhaseGradient,
          borderRadius: BorderRadius.circular(15),
          boxShadow: [
            BoxShadow(
              color: DesignSystem.primary(context).withValues(alpha: 0.2),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Center(
          child: isLoading
              ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                )
              : Text(
                  "Join Community",
                  style: GoogleFonts.plusJakartaSans(
                    color: Colors.black,
                    fontWeight: FontWeight.w800,
                  ),
                ),
        ),
      ),
    );
  }
}
