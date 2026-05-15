/// Backend base URL (no trailing slash).
///
/// Override at run time for local development, e.g.:
/// `flutter run --dart-define=API_BASE_URL=http://192.168.x.x:5000`
///
/// Production backend: https://educational-adventure-path-way-4zdc.onrender.com
class ApiConfig {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://192.168.137.103:5000',
  );

  static String apiPath(String path) {
    final p = path.startsWith('/') ? path : '/$path';
    return '$baseUrl$p';
  }
}
