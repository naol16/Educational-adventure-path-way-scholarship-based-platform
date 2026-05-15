/// Thrown when an API request fails or returns an unexpected payload.
class ApiException implements Exception {
  ApiException({
    required this.statusCode,
    required String message,
    this.body,
  }) : message = _formatMessage(statusCode, message);

  final int statusCode;
  final String message;
  final String? body;

  static String _formatMessage(int statusCode, String originalMessage) {
    if (statusCode >= 500 || 
        originalMessage.contains('max retries') || 
        originalMessage.contains('SocketException') ||
        originalMessage.contains('ClientException') ||
        originalMessage.contains('Connection refused')) {
      return 'Connection lost. Please check your network connection and try again.';
    }
    return originalMessage;
  }

  @override
  String toString() => message;
}







