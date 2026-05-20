import 'package:mobile/core/constants/api_config.dart';
import 'package:mobile/core/services/token_storage.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'dart:async';

class SocketService {
  final TokenStorage _tokenStorage;
  IO.Socket? _socket;

  final _messageController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _typingController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _alertController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _editController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _deleteController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _readController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _onlineController =
      StreamController<List<int>>.broadcast();

  SocketService(this._tokenStorage);

  Stream<Map<String, dynamic>> get messageStream => _messageController.stream;
  Stream<Map<String, dynamic>> get typingStream => _typingController.stream;
  Stream<Map<String, dynamic>> get alertStream => _alertController.stream;
  Stream<Map<String, dynamic>> get editStream => _editController.stream;
  Stream<Map<String, dynamic>> get deleteStream => _deleteController.stream;
  Stream<Map<String, dynamic>> get readStream => _readController.stream;
  Stream<List<int>> get onlineUsersStream => _onlineController.stream;

  bool get isConnected => _socket?.connected == true;

  Future<void> connect() async {
    if (_socket?.connected == true) return;

    final token = await _tokenStorage.readAccessToken();
    if (token == null) return;

    _socket = IO.io(
      ApiConfig.baseUrl,
      IO.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .setAuth({'token': token})
          .setReconnectionAttempts(5)
          .setReconnectionDelay(1000)
          .enableAutoConnect()
          .build(),
    );

    _socket!.onConnect((_) {
      print('[Socket] Connected: ${_socket?.id}');
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

    _socket!.on('message_edited', (data) {
      _editController.add(Map<String, dynamic>.from(data));
    });

    _socket!.on('message_deleted', (data) {
      _deleteController.add(Map<String, dynamic>.from(data));
    });

    _socket!.on('messages_read', (data) {
      _readController.add(Map<String, dynamic>.from(data));
    });

    _socket!.on('onlineUsers', (data) {
      if (data is List) {
        _onlineController.add(data.map((e) => e as int).toList());
      }
    });

    _socket!.onDisconnect((_) => print('[Socket] Disconnected'));
    _socket!.onConnectError((err) => print('[Socket] Error: $err'));
  }

  void joinConversation(int conversationId) {
    _socket?.emit('join_conversation', conversationId);
  }

  void leaveConversation(int conversationId) {
    _socket?.emit('leave_conversation', conversationId);
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
    _editController.close();
    _deleteController.close();
    _readController.close();
    _onlineController.close();
  }
}
