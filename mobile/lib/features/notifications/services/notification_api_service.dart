import 'package:mobile/core/services/api_client.dart';
import 'package:mobile/core/services/http_helpers.dart';
import 'package:mobile/features/notifications/models/notification_models.dart';

class NotificationApiService {
  final ApiClient apiClient;

  NotificationApiService({required this.apiClient});

  Future<List<NotificationModel>> getNotifications({bool unreadOnly = false}) async {
    final response = await apiClient.get(
      '/api/notifications',
      query: {'unreadOnly': unreadOnly.toString()},
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to fetch notifications: ${response.statusCode}');
    }

    final dataMap = decodeJsonObject(response);
    if (dataMap['status'] == 'success') {
      final List<dynamic> data = dataMap['data'];
      return data.map((json) => NotificationModel.fromJson(json)).toList();
    }
    throw Exception('Failed to fetch notifications');
  }

  Future<void> markAsRead(int id) async {
    await apiClient.patch('/api/notifications/$id/read', body: {});
  }

  Future<void> markAsClicked(int id) async {
    await apiClient.patch('/api/notifications/$id/click', body: {});
  }

  Future<void> markAllAsRead() async {
    await apiClient.patch('/api/notifications/read-all', body: {});
  }

  Future<void> updateFcmToken(String token) async {
    await apiClient.post('/api/notifications/token', body: {'token': token});
  }
}
