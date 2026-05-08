import 'package:mobile/models/user.dart';

class Counselor {
  final int id;
  final int userId;
  final String name;
  final String bio;
  final List<String> areasOfExpertise;
  final double hourlyRate;
  final int yearsOfExperience;
  final String verificationStatus;
  final bool isActive;
  final double rating;
  final int totalSessions;
  final String? profileImageUrl;
  final String? universityName;
  final String? currentPosition;
  final String? organization;
  final List<String> specializedCountries;
  final double? matchScore;

  Counselor({
    required this.id,
    required this.userId,
    required this.name,
    required this.bio,
    required this.areasOfExpertise,
    required this.hourlyRate,
    required this.yearsOfExperience,
    required this.verificationStatus,
    required this.isActive,
    required this.rating,
    required this.totalSessions,
    this.profileImageUrl,
    this.universityName,
    this.currentPosition,
    this.organization,
    required this.specializedCountries,
    this.matchScore,
  });

  factory Counselor.fromJson(Map<String, dynamic> json) {
    // areasOfExpertise can be a comma-separated string or a JSON array string
    List<String> _parseList(dynamic value) {
      if (value == null) return [];
      if (value is List) return value.map((e) => e.toString().trim()).toList();
      final str = value.toString().trim();
      if (str.startsWith('[')) {
        try {
          final decoded = (str
              .replaceAll('[', '')
              .replaceAll(']', '')
              .replaceAll('"', '')
              .split(','));
          return decoded.map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
        } catch (_) {}
      }
      return str.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
    }

    // Safe name extraction — json['user'] is dynamic, need explicit cast
    String _parseName() {
      final direct = json['name'];
      if (direct != null && direct is String && direct.isNotEmpty) return direct;
      final user = json['user'];
      if (user is Map) {
        final uName = user['name'];
        if (uName != null && uName is String && uName.isNotEmpty) return uName;
      }
      return '';
    }

    return Counselor(
      id: json['id'],
      userId: json['userId'] ?? 0,
      name: _parseName(),
      bio: json['bio'] ?? '',
      areasOfExpertise: _parseList(json['areasOfExpertise']),
      hourlyRate: double.tryParse(json['hourlyRate']?.toString() ?? '0') ?? 0.0,
      yearsOfExperience: json['yearsOfExperience'] ?? 0,
      verificationStatus: json['verificationStatus'] ?? 'pending',
      isActive: json['isActive'] ?? true,
      rating: double.tryParse(json['rating']?.toString() ?? '0') ?? 0.0,
      totalSessions: json['totalSessions'] ?? 0,
      profileImageUrl: json['profileImageUrl'] ?? (json['user']?['avatarUrl']),
      universityName: json['universityName'],
      currentPosition: json['currentPosition'],
      organization: json['organization'],
      specializedCountries: _parseList(json['specializedCountries']),
      // Backend returns 'recommendationScore' from the recommendations endpoint
      matchScore: double.tryParse(
            (json['recommendationScore'] ?? json['matchScore'])?.toString() ?? '',
          ),
    );
  }
}
