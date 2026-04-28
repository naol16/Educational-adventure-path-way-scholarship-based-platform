import 'package:mobile/models/user.dart';

class Counselor {
  final int id;
  final int userId;
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
    // Backend might return nested user object or just ID
    return Counselor(
      id: json['id'],
      userId: json['userId'] ?? 0,
      bio: json['bio'] ?? '',
      areasOfExpertise: (json['areasOfExpertise'] as String?)?.split(',').map((e) => e.trim()).toList() ?? [],
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
      specializedCountries: (json['specializedCountries'] as String?)?.split(',').map((e) => e.trim()).toList() ?? [],
      matchScore: double.tryParse(json['matchScore']?.toString() ?? ''),
    );
  }
}
