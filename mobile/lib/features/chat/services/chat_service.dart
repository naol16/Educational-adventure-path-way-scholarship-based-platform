import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/core/services/api_client.dart';
import 'package:mobile/features/chat/models/chat_models.dart';

class ChatService {
  final ApiClient _apiClient;

  ChatService(this._apiClient);

  Future<List<Conversation>> getConversations() async {
    try {
      final response = await _apiClient.get('/api/chat/conversations');
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final List raw = body['data'] ?? body ?? [];
        return raw
            .map((json) {
              try {
                return Conversation.fromJson(Map<String, dynamic>.from(json));
              } catch (_) {
                return null;
              }
            })
            .whereType<Conversation>()
            .toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  /// Fetches messages oldest-first (backend returns newest-first, we reverse).
  Future<List<ChatMessage>> getMessages(int conversationId, {int limit = 50, int offset = 0}) async {
    try {
      final response = await _apiClient.get(
        '/api/chat/$conversationId',
        query: {'limit': '$limit', 'offset': '$offset'},
      );
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final List raw = body['data'] ?? [];
        final msgs = raw
            .map((json) {
              try {
                return ChatMessage.fromJson(Map<String, dynamic>.from(json));
              } catch (_) {
                return null;
              }
            })
            .whereType<ChatMessage>()
            .toList();
        // Backend returns newest-first — reverse for chronological display
        return msgs.reversed.toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  Future<Conversation?> startChat(int userId) async {
    try {
      final response = await _apiClient.post('/api/chat/start', body: {'receiverId': userId});
      if (response.statusCode == 200 || response.statusCode == 201) {
        final body = jsonDecode(response.body);
        final data = body['data'];
        if (data != null) {
          return Conversation.fromJson(Map<String, dynamic>.from(data));
        }
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  /// Sends via HTTP (reliable fallback). Returns the saved message.
  Future<ChatMessage?> sendMessage(int receiverId, String content) async {
    try {
      final response = await _apiClient.post('/api/chat/send', body: {
        'receiverId': receiverId,
        'content': content,
      });
      if (response.statusCode == 201) {
        final body = jsonDecode(response.body);
        final msgJson = body['data']?['message'];
        if (msgJson != null) {
          return ChatMessage.fromJson(Map<String, dynamic>.from(msgJson));
        }
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<String?> uploadFile(String filePath) async {
    try {
      final multipartFile = await http.MultipartFile.fromPath('file', filePath);
      final response = await _apiClient.postMultipart(
        '/api/chat/upload',
        fields: {},
        files: [multipartFile],
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body)['data']['url'];
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<void> markAsRead(int conversationId) async {
    try {
      await _apiClient.patch('/api/chat/read/$conversationId');
    } catch (_) {}
  }
}
