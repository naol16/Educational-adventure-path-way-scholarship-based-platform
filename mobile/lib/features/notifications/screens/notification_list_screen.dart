import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/notifications/models/notification_models.dart';
import 'package:mobile/features/notifications/providers/notification_providers.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';

class NotificationListScreen extends ConsumerWidget {
  const NotificationListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifications = ref.watch(notificationsProvider);
    final notifier = ref.read(notificationsProvider.notifier);

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          if (notifications.any((n) => !n.isRead))
            TextButton(
              onPressed: () => notifier.markAllAsRead(),
              child: const Text('Mark all as read'),
            ),
        ],
      ),
      body: notifications.isEmpty
          ? _buildEmptyState(context)
          : RefreshIndicator(
              onRefresh: () => notifier.fetchNotifications(),
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: notifications.length,
                itemBuilder: (context, index) {
                  return _buildNotificationItem(context, ref, notifications[index]);
                },
              ),
            ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.bellOff, size: 64, color: DesignSystem.labelText(context).withValues(alpha: 0.5)),
          const SizedBox(height: 16),
          Text(
            'No notifications yet',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: DesignSystem.mainText(context),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'We\'ll notify you when something important happens.',
            style: GoogleFonts.inter(
              color: DesignSystem.labelText(context),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationItem(BuildContext context, WidgetRef ref, NotificationModel notification) {
    final isUnread = !notification.isRead;
    
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          if (isUnread) {
            ref.read(notificationsProvider.notifier).markAsRead(notification.id);
          }
          _handleNotificationClick(context, notification);
        },
        borderRadius: BorderRadius.circular(16),
        child: GlassContainer(
          padding: const EdgeInsets.all(16),
          borderRadius: 16,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildTypeIcon(context, notification.type),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            notification.title,
                            style: GoogleFonts.plusJakartaSans(
                              fontWeight: isUnread ? FontWeight.w800 : FontWeight.w600,
                              fontSize: 14,
                              color: DesignSystem.mainText(context),
                            ),
                          ),
                        ),
                        Text(
                          notification.timeAgo,
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            color: DesignSystem.labelText(context).withValues(alpha: 0.7),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      notification.message,
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        color: DesignSystem.labelText(context),
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
              if (isUnread)
                Container(
                  margin: const EdgeInsets.only(left: 8, top: 4),
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: DesignSystem.primary(context),
                    shape: BoxShape.circle,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTypeIcon(BuildContext context, NotificationType type) {
    IconData icon;
    Color color;

    switch (type) {
      case NotificationType.scholarshipMatch:
        icon = LucideIcons.graduationCap;
        color = const Color(0xFF10B981);
        break;
      case NotificationType.booking:
        icon = LucideIcons.calendar;
        color = DesignSystem.primary(context);
        break;
      case NotificationType.payment:
        icon = LucideIcons.creditCard;
        color = const Color(0xFFF59E0B);
        break;
      default:
        icon = LucideIcons.bell;
        color = DesignSystem.labelText(context);
    }

    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Icon(icon, color: color, size: 20),
    );
  }

  void _handleNotificationClick(BuildContext context, NotificationModel notification) {
    switch (notification.type) {
      case NotificationType.scholarshipMatch:
        if (notification.relatedId != null) {
          context.push('/scholarships/${notification.relatedId}');
        }
        break;
      case NotificationType.booking:
        context.push('/counselor-sessions');
        break;
      case NotificationType.payment:
        context.push('/counselor-wallet');
        break;
      default:
        break;
    }
  }
}
