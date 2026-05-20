import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/chat/models/chat_models.dart';
import 'package:mobile/features/chat/providers/chat_providers.dart';
import 'package:mobile/features/chat/providers/group_chat_providers.dart';
import 'package:mobile/features/chat/screens/mentor_chat_screen.dart';
import 'package:mobile/features/chat/screens/group_chat_preview_screen.dart';

/// Unified conversation list — mirrors the web ChatList with All / Direct / Groups tabs.
class ChatListScreen extends ConsumerStatefulWidget {
  const ChatListScreen({super.key});

  @override
  ConsumerState<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends ConsumerState<ChatListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();
  String _query = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _searchController.addListener(() {
      setState(() => _query = _searchController.text.toLowerCase());
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final convsAsync = ref.watch(conversationsProvider);
    final groupsAsync = ref.watch(availableGroupsProvider);
    final currentUser = ref.watch(currentUserProvider);

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(context),
            _buildSearchBar(context),
            _buildTabBar(context),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  // All tab — DMs + groups merged
                  _buildAllTab(convsAsync, groupsAsync, currentUser?.id ?? 0),
                  // Direct tab — DMs only
                  _buildDirectTab(convsAsync, currentUser?.id ?? 0),
                  // Groups tab
                  _buildGroupsTab(groupsAsync, currentUser?.id ?? 0),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: Row(
        children: [
          Expanded(
            child: Text(
              'Messages',
              style: GoogleFonts.plusJakartaSans(
                color: DesignSystem.mainText(context),
                fontSize: 26,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          Icon(LucideIcons.messageSquare,
              color: DesignSystem.primary(context), size: 24),
        ],
      ),
    );
  }

  Widget _buildSearchBar(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: Container(
        height: 42,
        decoration: BoxDecoration(
          color: DesignSystem.surface(context),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: DesignSystem.glassBorder(context)),
        ),
        child: Row(
          children: [
            const SizedBox(width: 12),
            Icon(LucideIcons.search,
                size: 16, color: DesignSystem.labelText(context)),
            const SizedBox(width: 8),
            Expanded(
              child: TextField(
                controller: _searchController,
                style: GoogleFonts.inter(
                    color: DesignSystem.mainText(context), fontSize: 14),
                decoration: InputDecoration(
                  hintText: 'Search conversations…',
                  hintStyle: GoogleFonts.inter(
                      color: DesignSystem.labelText(context), fontSize: 14),
                  border: InputBorder.none,
                  isDense: true,
                ),
              ),
            ),
            if (_query.isNotEmpty)
              GestureDetector(
                onTap: () => _searchController.clear(),
                child: Padding(
                  padding: const EdgeInsets.only(right: 10),
                  child: Icon(LucideIcons.x,
                      size: 16, color: DesignSystem.labelText(context)),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabBar(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: TabBar(
        controller: _tabController,
        labelStyle: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600),
        unselectedLabelStyle:
            GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w400),
        labelColor: DesignSystem.primary(context),
        unselectedLabelColor: DesignSystem.labelText(context),
        indicator: BoxDecoration(
          color: DesignSystem.primary(context).withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(20),
        ),
        indicatorSize: TabBarIndicatorSize.tab,
        dividerColor: Colors.transparent,
        tabs: const [
          Tab(text: 'All'),
          Tab(text: 'Direct'),
          Tab(text: 'Groups'),
        ],
      ),
    );
  }

  Widget _buildAllTab(AsyncValue<List<Conversation>> convsAsync,
      AsyncValue<List<Conversation>> groupsAsync, int currentUserId) {
    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(conversationsProvider);
        ref.invalidate(availableGroupsProvider);
      },
      color: DesignSystem.primary(context),
      child: convsAsync.when(
        loading: () => _buildSkeletonList(),
        error: (_, __) => _buildError(),
        data: (convs) {
          final groups = groupsAsync.valueOrNull ?? [];
          // Merge: DMs first, then groups not already in convs
          final groupIds = convs.map((c) => c.numericId).toSet();
          final extraGroups =
              groups.where((g) => !groupIds.contains(g.numericId)).toList();
          final all = [...convs, ...extraGroups];
          final filtered = _filter(all, currentUserId);
          if (filtered.isEmpty) return _buildEmpty('No conversations yet.');
          return _buildList(filtered, currentUserId);
        },
      ),
    );
  }

  Widget _buildDirectTab(AsyncValue<List<Conversation>> convsAsync, int currentUserId) {
    return RefreshIndicator(
      onRefresh: () async => ref.invalidate(conversationsProvider),
      color: DesignSystem.primary(context),
      child: convsAsync.when(
        loading: () => _buildSkeletonList(),
        error: (_, __) => _buildError(),
        data: (convs) {
          final dms = convs.where((c) => !c.isGroup).toList();
          final filtered = _filter(dms, currentUserId);
          if (filtered.isEmpty) return _buildEmpty('No direct messages yet.');
          return _buildList(filtered, currentUserId);
        },
      ),
    );
  }

  Widget _buildGroupsTab(
      AsyncValue<List<Conversation>> groupsAsync, int currentUserId) {
    return RefreshIndicator(
      onRefresh: () async => ref.invalidate(availableGroupsProvider),
      color: DesignSystem.primary(context),
      child: groupsAsync.when(
        loading: () => _buildSkeletonList(),
        error: (_, __) => _buildError(),
        data: (groups) {
          final filtered = _filter(groups, currentUserId);
          if (filtered.isEmpty) return _buildEmpty('No groups available.');
          return _buildList(filtered, currentUserId);
        },
      ),
    );
  }

  List<Conversation> _filter(List<Conversation> list, int currentUserId) {
    if (_query.isEmpty) return list;
    return list.where((c) {
      final title = c.isGroup
          ? (c.name ?? 'Group')
          : c.getOtherParticipant(currentUserId).name;
      return title.toLowerCase().contains(_query);
    }).toList();
  }

  Widget _buildList(List<Conversation> items, int currentUserId) {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
      itemCount: items.length,
      itemBuilder: (ctx, i) =>
          _buildConvTile(ctx, items[i], currentUserId),
    );
  }

  Widget _buildConvTile(
      BuildContext context, Conversation conv, int currentUserId) {
    final primary = DesignSystem.primary(context);
    final lastMsg = conv.lastMessage;
    final isGroup = conv.isGroup;
    final otherUser =
        isGroup ? null : conv.getOtherParticipant(currentUserId);
    final title = isGroup ? (conv.name ?? 'Group') : otherUser!.name;
    final subtitle = lastMsg?.content ??
        (isGroup
            ? '${conv.participants.length} members'
            : otherUser?.role ?? '');
    final timeStr = lastMsg != null
        ? _formatTime(lastMsg.createdAt)
        : '';
    final unread = conv.unreadCount;

    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(18),
          onTap: () => _openConversation(context, conv, currentUserId),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: DesignSystem.surface(context),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: DesignSystem.glassBorder(context)),
            ),
            child: Row(
              children: [
                // Avatar
                Stack(
                  children: [
                    CircleAvatar(
                      radius: 26,
                      backgroundColor: primary.withValues(alpha: 0.1),
                      backgroundImage: (!isGroup && otherUser?.avatarUrl != null)
                          ? NetworkImage(otherUser!.avatarUrl!)
                          : null,
                      child: (isGroup || otherUser?.avatarUrl == null)
                          ? isGroup
                              ? Icon(LucideIcons.users,
                                  color: primary, size: 20)
                              : Text(
                                  title.substring(0, 1).toUpperCase(),
                                  style: GoogleFonts.plusJakartaSans(
                                      color: primary,
                                      fontWeight: FontWeight.w800,
                                      fontSize: 18),
                                )
                          : null,
                    ),
                    // Unread badge
                    if (unread > 0)
                      Positioned(
                        top: 0,
                        right: 0,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                              color: primary, shape: BoxShape.circle),
                          child: Text(
                            unread > 99 ? '99+' : '$unread',
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(width: 12),
                // Content
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              title,
                              style: GoogleFonts.plusJakartaSans(
                                color: DesignSystem.mainText(context),
                                fontWeight: unread > 0
                                    ? FontWeight.w700
                                    : FontWeight.w600,
                                fontSize: 15,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text(
                            timeStr,
                            style: GoogleFonts.inter(
                              color: unread > 0
                                  ? primary
                                  : DesignSystem.labelText(context),
                              fontSize: 11,
                              fontWeight: unread > 0
                                  ? FontWeight.w600
                                  : FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              subtitle.startsWith('[Attached File]')
                                  ? '📎 File'
                                  : subtitle,
                              style: GoogleFonts.inter(
                                color: unread > 0
                                    ? DesignSystem.mainText(context)
                                    : DesignSystem.labelText(context),
                                fontSize: 13,
                                fontWeight: unread > 0
                                    ? FontWeight.w500
                                    : FontWeight.w400,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (isGroup && !conv.isJoined)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: primary.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text('Join',
                                  style: GoogleFonts.inter(
                                      color: primary,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold)),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _openConversation(
      BuildContext context, Conversation conv, int currentUserId) {
    if (conv.isGroup) {
      Navigator.push(
        context,
        MaterialPageRoute(
            builder: (_) => GroupChatPreviewScreen(group: conv)),
      );
    } else {
      final otherUser = conv.getOtherParticipant(currentUserId);
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => MentorChatScreen(
            conversationId: conv.numericId,
            otherUser: otherUser,
          ),
        ),
      );
    }
  }

  String _formatTime(DateTime date) {
    final now = DateTime.now();
    if (date.year == now.year &&
        date.month == now.month &&
        date.day == now.day) {
      return DateFormat('HH:mm').format(date);
    }
    final yesterday = now.subtract(const Duration(days: 1));
    if (date.year == yesterday.year &&
        date.month == yesterday.month &&
        date.day == yesterday.day) {
      return 'Yesterday';
    }
    return DateFormat('d.MM.yy').format(date);
  }

  Widget _buildSkeletonList() {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      itemCount: 6,
      itemBuilder: (_, __) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Container(
          height: 72,
          decoration: BoxDecoration(
            color: DesignSystem.surface(context),
            borderRadius: BorderRadius.circular(18),
          ),
          child: Row(
            children: [
              const SizedBox(width: 12),
              Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                      color: DesignSystem.surfaceMediumColor(context),
                      shape: BoxShape.circle)),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                        height: 13,
                        width: 120,
                        decoration: BoxDecoration(
                            color: DesignSystem.surfaceMediumColor(context),
                            borderRadius: BorderRadius.circular(6))),
                    const SizedBox(height: 6),
                    Container(
                        height: 11,
                        width: 180,
                        decoration: BoxDecoration(
                            color: DesignSystem.surfaceMediumColor(context)
                                .withValues(alpha: 0.6),
                            borderRadius: BorderRadius.circular(6))),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmpty(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.messageSquareDashed,
              color: DesignSystem.labelText(context), size: 52),
          const SizedBox(height: 12),
          Text(message,
              style: GoogleFonts.inter(
                  color: DesignSystem.labelText(context), fontSize: 14)),
        ],
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.wifiOff,
              color: DesignSystem.labelText(context), size: 48),
          const SizedBox(height: 12),
          Text('Failed to load',
              style: GoogleFonts.inter(
                  color: DesignSystem.labelText(context), fontSize: 14)),
          const SizedBox(height: 12),
          TextButton(
            onPressed: () {
              ref.invalidate(conversationsProvider);
              ref.invalidate(availableGroupsProvider);
            },
            child: Text('Retry',
                style: TextStyle(color: DesignSystem.primary(context))),
          ),
        ],
      ),
    );
  }
}
