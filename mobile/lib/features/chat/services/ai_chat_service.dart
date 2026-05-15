import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/services/api_client.dart';
import 'package:mobile/core/providers/dependencies.dart';

class AIChatService {
  final ApiClient _apiClient;

  AIChatService(this._apiClient);

  Future<List<Map<String, dynamic>>> getChatHistory({int? scholarshipId, required String sessionId}) async {
    try {
      String url = '/api/ai-chat/history?sessionId=$sessionId';
      if (scholarshipId != null) {
        url += '&scholarshipId=$scholarshipId';
      }
      
      final response = await _apiClient.get(url);
      if (response.statusCode == 200) {
        final List raw = jsonDecode(response.body);
        return raw.map((e) => Map<String, dynamic>.from(e)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<Map<String, dynamic>?> sendMessage(String message, String sessionId, {int? scholarshipId}) async {
    try {
      final endpoint = scholarshipId != null 
          ? '/api/ai-chat/scholarship/$scholarshipId'
          : '/api/ai-chat/general';

      final response = await _apiClient.post(endpoint, body: {
        'message': message,
        'sessionId': sessionId,
      });

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}

final aiChatServiceProvider = Provider<AIChatService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AIChatService(apiClient);
});
