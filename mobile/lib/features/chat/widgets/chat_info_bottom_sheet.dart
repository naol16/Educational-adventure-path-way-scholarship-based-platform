import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/chat/models/chat_models.dart';
import 'package:mobile/features/chat/providers/chat_providers.dart';
import 'package:mobile/features/chat/providers/group_chat_providers.dart';
import 'package:mobile/features/chat/screens/mentor_chat_screen.dart';
import 'package:mobile/features/chat/services/chat_service.dart';
import 'package:mobile/models/user.dart';

class ChatInfoBottomSheet extends ConsumerWidget {
  final Conversation conversation;
  final User otherUser; // For DMs, this is the other user. For Groups, this can be other participant or first participant.

  const ChatInfoBottomSheet({
    super.key,
    required this.conversation,
    required this.otherUser,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentUser = ref.watch(currentUserProvider);
    final themeBg = DesignSystem.overlayBackground(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: themeBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        top: 8,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).padding.bottom + 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 40,
              height: 5,
              decoration: BoxDecoration(
                color: DesignSystem.labelText(context).withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
          const SizedBox(height: 20),

          if (conversation.isGroup)
            _buildGroupInfo(context, ref, currentUser)
          else
            _buildDMInfo(context, ref, currentUser),
        ],
      ),
    );
  }

  Widget _buildGroupInfo(BuildContext context, WidgetRef ref, User? currentUser) {
    final groupId = conversation.numericId;
    final membersAsync = ref.watch(groupMembersProvider(groupId));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Group Header Info
        Row(
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                gradient: DesignSystem.easyPhaseGradient,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                LucideIcons.users,
                color: Colors.white,
                size: 28,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    conversation.name ?? "Group Chat",
                    style: DesignSystem.headingStyle(
                      buildContext: context,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (conversation.country != null && conversation.country!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(
                          LucideIcons.globe,
                          size: 14,
                          color: DesignSystem.labelText(context),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          conversation.country!,
                          style: DesignSystem.bodyStyle(
                            buildContext: context,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (conversation.description != null && conversation.description!.isNotEmpty) ...[
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: DesignSystem.surface(context),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: DesignSystem.glassBorder(context)),
            ),
            child: Text(
              conversation.description!,
              style: DesignSystem.bodyStyle(
                buildContext: context,
                fontSize: 14,
              ),
            ),
          ),
          const SizedBox(height: 20),
        ],

        // Members List Header
        Text(
          "Members List",
          style: DesignSystem.headingStyle(
            buildContext: context,
            fontSize: 16,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 10),

        // Members list
        ConstrainedBox(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.35,
          ),
          child: membersAsync.when(
            data: (members) {
              if (members.isEmpty) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    child: Text(
                      "No members found",
                      style: DesignSystem.bodyStyle(buildContext: context),
                    ),
                  ),
                );
              }
              return ListView.separated(
                shrinkWrap: true,
                itemCount: members.length,
                separatorBuilder: (context, index) => Divider(
                  color: DesignSystem.dividerColor(context),
                  height: 1,
                ),
                itemBuilder: (context, index) {
                  final member = members[index];
                  final isMe = currentUser != null && member.id == currentUser.id;

                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 18,
                          backgroundColor: DesignSystem.surfaceMediumColor(context),
                          backgroundImage: member.avatarUrl != null
                              ? NetworkImage(member.avatarUrl!)
                              : null,
                          child: member.avatarUrl == null
                              ? Text(
                                  member.name.isNotEmpty
                                      ? member.name[0].toUpperCase()
                                      : 'U',
                                  style: DesignSystem.headingStyle(
                                    buildContext: context,
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                  ),
                                )
                              : null,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Flexible(
                                    child: Text(
                                      member.name,
                                      style: DesignSystem.bodyStyle(
                                        buildContext: context,
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
                                      ),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  if (isMe) ...[
                                    const SizedBox(width: 6),
                                    Text(
                                      "(You)",
                                      style: DesignSystem.labelStyle(
                                        buildContext: context,
                                        fontSize: 10,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 2),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: member.isCounselor
                                      ? DesignSystem.primary(context).withValues(alpha: 0.15)
                                      : DesignSystem.labelText(context).withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  member.role.toUpperCase(),
                                  style: DesignSystem.labelStyle(
                                    buildContext: context,
                                    fontSize: 9,
                                    color: member.isCounselor
                                        ? DesignSystem.primary(context)
                                        : DesignSystem.labelText(context),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (!isMe)
                          IconButton(
                            icon: Icon(
                              LucideIcons.messageSquare,
                              color: DesignSystem.primary(context),
                              size: 20,
                            ),
                            onPressed: () => _startPrivateDM(context, ref, member),
                          ),
                      ],
                    ),
                  );
                },
              );
            },
            loading: () => const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 20),
                child: CircularProgressIndicator(),
              ),
            ),
            error: (err, stack) => Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 20),
                child: Text(
                  "Failed to load members",
                  style: DesignSystem.bodyStyle(
                    buildContext: context,
                    color: DesignSystem.error(context),
                  ),
                ),
              ),
            ),
          ),
        ),

        const SizedBox(height: 24),

        // Leave Group Button
        ElevatedButton.icon(
          onPressed: () => _confirmLeaveGroup(context, ref),
          icon: const Icon(LucideIcons.logOut, size: 16, color: Colors.white),
          label: const Text("Leave Group", style: TextStyle(color: Colors.white)),
          style: ElevatedButton.styleFrom(
            backgroundColor: DesignSystem.error(context),
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDMInfo(BuildContext context, WidgetRef ref, User? currentUser) {
    final fieldsOfStudy = otherUser.fieldOfStudyInput?.join(', ') ?? '';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // DM Header Info
        Center(
          child: Column(
            children: [
              CircleAvatar(
                radius: 40,
                backgroundColor: DesignSystem.surfaceMediumColor(context),
                backgroundImage: otherUser.avatarUrl != null
                    ? NetworkImage(otherUser.avatarUrl!)
                    : null,
                child: otherUser.avatarUrl == null
                    ? Text(
                        otherUser.name.isNotEmpty
                            ? otherUser.name[0].toUpperCase()
                            : 'U',
                        style: DesignSystem.headingStyle(
                          buildContext: context,
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                        ),
                      )
                    : null,
              ),
              const SizedBox(height: 12),
              Text(
                otherUser.fullName ?? otherUser.name,
                style: DesignSystem.headingStyle(
                  buildContext: context,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: otherUser.isCounselor
                      ? DesignSystem.primary(context).withValues(alpha: 0.15)
                      : DesignSystem.labelText(context).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  otherUser.role.toUpperCase(),
                  style: DesignSystem.labelStyle(
                    buildContext: context,
                    fontSize: 11,
                    color: otherUser.isCounselor
                        ? DesignSystem.primary(context)
                        : DesignSystem.labelText(context),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // User Details
        Text(
          "Details",
          style: DesignSystem.headingStyle(
            buildContext: context,
            fontSize: 16,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 12),

        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: DesignSystem.surface(context),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: DesignSystem.glassBorder(context)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildDetailRow(context, "Email", otherUser.email, LucideIcons.mail),
              if (otherUser.nationality != null && otherUser.nationality!.isNotEmpty) ...[
                const SizedBox(height: 12),
                _buildDetailRow(context, "Nationality", otherUser.nationality!, LucideIcons.flag),
              ],
              if (otherUser.countryOfResidence != null && otherUser.countryOfResidence!.isNotEmpty) ...[
                const SizedBox(height: 12),
                _buildDetailRow(context, "Location", otherUser.countryOfResidence!, LucideIcons.mapPin),
              ],
              if (fieldsOfStudy.isNotEmpty) ...[
                const SizedBox(height: 12),
                _buildDetailRow(context, "Fields of Study", fieldsOfStudy, LucideIcons.bookOpen),
              ],
              if (otherUser.previousUniversity != null && otherUser.previousUniversity!.isNotEmpty) ...[
                const SizedBox(height: 12),
                _buildDetailRow(context, "Previous University", otherUser.previousUniversity!, LucideIcons.graduationCap),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDetailRow(BuildContext context, String label, String value, IconData icon) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: 16,
          color: DesignSystem.labelText(context),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: DesignSystem.labelStyle(
                  buildContext: context,
                  fontSize: 11,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: DesignSystem.bodyStyle(
                  buildContext: context,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: DesignSystem.mainText(context),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Future<void> _startPrivateDM(BuildContext context, WidgetRef ref, User member) async {
    // Show a dialog/spinner or simple overlay
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    final chatService = ref.read(chatServiceProvider);
    final conversation = await chatService.startChat(member.id);

    if (context.mounted) {
      Navigator.pop(context); // Pop loading spinner
    }

    if (conversation != null) {
      if (context.mounted) {
        Navigator.pop(context); // Close bottom sheet
        // Navigate to the newly opened private chat screen
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => MentorChatScreen(
              conversationId: conversation.numericId,
              otherUser: member,
              isGroup: false,
            ),
          ),
        );
      }
    } else {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              "Could not start conversation with ${member.name}",
              style: const TextStyle(color: Colors.white),
            ),
            backgroundColor: DesignSystem.error(context),
          ),
        );
      }
    }
  }

  void _confirmLeaveGroup(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: DesignSystem.overlayBackground(context),
        title: Text(
          "Leave Group",
          style: DesignSystem.headingStyle(buildContext: context, fontSize: 18),
        ),
        content: Text(
          "Are you sure you want to leave this group chat?",
          style: DesignSystem.bodyStyle(buildContext: context),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(
              "Cancel",
              style: TextStyle(color: DesignSystem.labelText(context)),
            ),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx); // Close dialog

              // Show loading
              showDialog(
                context: context,
                barrierDismissible: false,
                builder: (context) => const Center(child: CircularProgressIndicator()),
              );

              final success = await ref
                  .read(groupChatActionProvider.notifier)
                  .leaveGroup(conversation.numericId);

              if (context.mounted) {
                Navigator.pop(context); // Close loading dialog
              }

              if (success) {
                if (context.mounted) {
                  Navigator.pop(context); // Close Bottom Sheet
                  Navigator.pop(context); // Close Chat Screen (pop back to list)
                }
              } else {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: const Text(
                        "Failed to leave group.",
                        style: TextStyle(color: Colors.white),
                      ),
                      backgroundColor: DesignSystem.error(context),
                    ),
                  );
                }
              }
            },
            child: Text(
              "Leave",
              style: TextStyle(color: DesignSystem.error(context)),
            ),
          ),
        ],
      ),
    );
  }
}
