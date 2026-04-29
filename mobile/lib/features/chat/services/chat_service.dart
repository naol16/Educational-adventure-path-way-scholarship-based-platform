import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/core/services/api_client.dart';
import 'package:mobile/features/chat/models/chat_models.dart';

class ChatService {
  final ApiClient _apiClient;

  ChatService(this._apiClient);

  Future<List<Conversation>> getConversations() async {
    final response = await _apiClient.get('/api/chat/conversations');
    if (response.statusCode == 200) {
      final List data = jsonDecode(response.body)['data'];
      return data.map((json) => Conversation.fromJson(json)).toList();
    }
    return [];
  }

  Future<List<ChatMessage>> getMessages(int conversationId) async {
    final response = await _apiClient.get('/api/chat/$conversationId');
    if (response.statusCode == 200) {
      final List data = jsonDecode(response.body)['data'];
      return data.map((json) => ChatMessage.fromJson(json)).toList();
    }
    return [];
  }

  Future<Conversation?> startChat(int userId) async {
    final response = await _apiClient.post('/api/chat/start', body: {
      'receiverId': userId,
    });
    if (response.statusCode == 200 || response.statusCode == 201) {
      return Conversation.fromJson(jsonDecode(response.body)['data']);
    }
    return null;
  }

  Future<ChatMessage?> sendMessage(int receiverId, String content) async {
    final response = await _apiClient.post('/api/chat/send', body: {
      'receiverId': receiverId,
      'content': content,
    });
    if (response.statusCode == 201) {
      return ChatMessage.fromJson(jsonDecode(response.body)['data']['message']);
    }
    return null;
  }

  Future<String?> uploadFile(String filePath) async {
    final multipartFile = await http.MultipartFile.fromPath('file', filePath);
    final response = await _apiClient.postMultipart('/api/chat/upload', 
      fields: {},
      files: [multipartFile],
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body)['data']['url'];
    }
    return null;
  }

  Future<void> markAsRead(int conversationId) async {
    await _apiClient.patch('/api/chat/read/$conversationId');
  }
}
