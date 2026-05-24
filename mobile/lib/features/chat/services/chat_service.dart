import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/core/services/api_client.dart';
import 'package:mobile/features/chat/models/chat_models.dart';
import 'package:mobile/models/user.dart';

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
  Future<List<ChatMessage>> getMessages(int conversationId,
      {int page = 1, int limit = 50}) async {
    try {
      final response = await _apiClient.get(
        '/api/chat/$conversationId',
        query: {'page': '$page', 'limit': '$limit'},
      );
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        // Support both paginated { data: { data: [...] } } and flat array
        final dataObj = body['data'] is Map ? body['data'] : null;
        final List raw = dataObj?['data'] ?? (body['data'] is List ? body['data'] : []);
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
      final response =
          await _apiClient.post('/api/chat/start', body: {'receiverId': userId});
      if (response.statusCode == 200 || response.statusCode == 201) {
        final body = jsonDecode(response.body);
        final data = body['data'] ?? body;
        if (data != null) {
          return Conversation.fromJson(Map<String, dynamic>.from(data));
        }
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  /// Send a message to a conversation (works for both DMs and groups).
  Future<ChatMessage?> sendMessage(int conversationId, String content,
      {int? replyToId}) async {
    try {
      final Map<String, dynamic> body = {
        'conversationId': conversationId,
        'content': content,
      };
      if (replyToId != null) body['replyToId'] = replyToId;

      final response = await _apiClient.post('/api/chat/send', body: body);
      if (response.statusCode == 200 || response.statusCode == 201) {
        final respBody = jsonDecode(response.body);
        final msgJson = respBody['data']?['message'] ?? respBody['message'];
        if (msgJson != null) {
          return ChatMessage.fromJson(Map<String, dynamic>.from(msgJson));
        }
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<bool> editMessage(int messageId, String content) async {
    try {
      final response = await _apiClient.patch(
        '/api/chat/messages/$messageId',
        body: {'content': content},
      );
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  Future<bool> deleteMessage(int messageId) async {
    try {
      final response = await _apiClient.delete('/api/chat/messages/$messageId');
      return response.statusCode == 200;
    } catch (_) {
      return false;
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

  // --- Group Chat Methods ---

  Future<List<Conversation>> getGroupConversations() async {
    try {
      final response = await _apiClient.get('/api/groups');
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final List raw = body is List ? body : (body['data'] ?? []);
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

  Future<bool> joinGroup(int groupId) async {
    try {
      final response = await _apiClient.post('/api/groups/$groupId/join');
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (_) {
      return false;
    }
  }

  Future<bool> leaveGroup(int groupId) async {
    try {
      final response = await _apiClient.delete('/api/groups/$groupId/leave');
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  Future<List<User>> getGroupMembers(int groupId) async {
    try {
      final response = await _apiClient.get('/api/groups/$groupId/members');
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final List raw = body['data'] ?? body ?? [];
        return raw
            .map((json) {
              try {
                return User.fromJson(Map<String, dynamic>.from(json));
              } catch (_) {
                return null;
              }
            })
            .whereType<User>()
            .toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }
}
