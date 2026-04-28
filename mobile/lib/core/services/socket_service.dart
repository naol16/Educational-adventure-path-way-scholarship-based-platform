import 'package:mobile/core/constants/api_config.dart';
import 'package:mobile/core/services/token_storage.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'dart:async';

class SocketService {
  final TokenStorage _tokenStorage;
  IO.Socket? _socket;
  
  final _messageController = StreamController<Map<String, dynamic>>.broadcast();
  final _typingController = StreamController<Map<String, dynamic>>.broadcast();
  final _alertController = StreamController<Map<String, dynamic>>.broadcast();

  SocketService(this._tokenStorage);

  Stream<Map<String, dynamic>> get messageStream => _messageController.stream;
  Stream<Map<String, dynamic>> get typingStream => _typingController.stream;
  Stream<Map<String, dynamic>> get alertStream => _alertController.stream;

  Future<void> connect() async {
    if (_socket?.connected == true) return;

    final token = await _tokenStorage.readAccessToken();
    if (token == null) return;

    _socket = IO.io(ApiConfig.baseUrl, IO.OptionBuilder()
      .setTransports(['websocket'])
      .setAuth({'token': token})
      .enableAutoConnect()
      .build());

    _socket!.onConnect((_) {
      print('[Socket] Connected to backend');
    });

    _socket!.on('receive_message', (data) {
      _messageController.add(Map<String, dynamic>.from(data));
    });

    _socket!.on('user_typing', (data) {
      _typingController.add(Map<String, dynamic>.from(data));
    });

    _socket!.on('new_message_alert', (data) {
      _alertController.add(Map<String, dynamic>.from(data));
    });

    _socket!.onDisconnect((_) => print('[Socket] Disconnected'));
    _socket!.onConnectError((err) => print('[Socket] Connection Error: $err'));
  }

  void joinConversation(int conversationId) {
    _socket?.emit('join_conversation', conversationId);
  }

  void sendMessage(int conversationId, int receiverId, String content) {
    _socket?.emit('send_message', {
      'conversationId': conversationId,
      'receiverId': receiverId,
      'content': content,
    });
  }

  void sendTyping(int conversationId, bool isTyping) {
    _socket?.emit('typing', {
      'conversationId': conversationId,
      'isTyping': isTyping,
    });
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }

  void dispose() {
    disconnect();
    _messageController.close();
    _typingController.close();
    _alertController.close();
  }
}
