import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:mobile/core/providers/dependencies.dart';
import 'package:mobile/features/notifications/models/notification_models.dart';
import 'package:mobile/features/notifications/services/notification_api_service.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/models/models.dart';

final notificationApiServiceProvider = Provider<NotificationApiService>((ref) {
  return NotificationApiService(apiClient: ref.watch(apiClientProvider));
});

final notificationsProvider = StateNotifierProvider<NotificationNotifier, List<NotificationModel>>((ref) {
  final apiService = ref.watch(notificationApiServiceProvider);
  final authState = ref.watch(authProvider);
  return NotificationNotifier(apiService, authState);
});

class NotificationNotifier extends StateNotifier<List<NotificationModel>> {
  final NotificationApiService _apiService;
  final AsyncValue<User?> _authState;
  Timer? _pollingTimer;
  StreamSubscription<RemoteMessage>? _foregroundSubscription;

  NotificationNotifier(this._apiService, this._authState) : super([]) {
    if (_authState.hasValue && _authState.value != null) {
      _init();
    }
  }

  void _init() {
    fetchNotifications();
    _setupFcm();
    _startPolling();
    _setupForegroundListener();
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    _foregroundSubscription?.cancel();
    super.dispose();
  }

  Future<void> fetchNotifications() async {
    try {
      final notifications = await _apiService.getNotifications();
      state = notifications;
    } catch (e) {
      print('Error fetching notifications: $e');
    }
  }

  void _startPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(const Duration(seconds: 60), (_) => fetchNotifications());
  }

  void _setupForegroundListener() {
    _foregroundSubscription?.cancel();
    _foregroundSubscription = FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      // Refresh notifications when a new message arrives in foreground
      fetchNotifications();
    });
  }

  Future<void> _setupFcm() async {
    try {
      final messaging = FirebaseMessaging.instance;
      
      // Request permissions (iOS)
      await messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      // Get token
      final token = await messaging.getToken();
      if (token != null) {
        await _apiService.updateFcmToken(token);
      }

      // Listen for token refresh
      messaging.onTokenRefresh.listen((newToken) {
        _apiService.updateFcmToken(newToken);
      });
    } catch (e) {
      print('Error setting up FCM: $e');
    }
  }

  Future<void> markAsRead(int id) async {
    try {
      await _apiService.markAsRead(id);
      state = state.map((n) => n.id == id ? NotificationModel(
        id: n.id,
        userId: n.userId,
        title: n.title,
        message: n.message,
        type: n.type,
        relatedId: n.relatedId,
        isRead: true,
        isClicked: n.isClicked,
        createdAt: n.createdAt,
      ) : n).toList();
    } catch (e) {
      print('Error marking as read: $e');
    }
  }

  Future<void> markAllAsRead() async {
    try {
      await _apiService.markAllAsRead();
      state = state.map((n) => NotificationModel(
        id: n.id,
        userId: n.userId,
        title: n.title,
        message: n.message,
        type: n.type,
        relatedId: n.relatedId,
        isRead: true,
        isClicked: n.isClicked,
        createdAt: n.createdAt,
      )).toList();
    } catch (e) {
      print('Error marking all as read: $e');
    }
  }
}

final unreadNotificationsCountProvider = Provider<int>((ref) {
  final notifications = ref.watch(notificationsProvider);
  return notifications.where((n) => !n.isRead).length;
});
