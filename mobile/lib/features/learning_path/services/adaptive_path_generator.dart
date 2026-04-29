import 'package:mobile/features/learning_path/models/learning_path.dart';

enum AdaptiveLevel { easy, medium, hard }

class AdaptivePathGenerator {
  static AdaptiveLevel calculateLevel(String examType, double score) {
    if (examType.toUpperCase() == 'IELTS') {
      if (score < 5.5) return AdaptiveLevel.easy;
      if (score <= 7.0) return AdaptiveLevel.medium;
      return AdaptiveLevel.hard;
    } else {
      // TOEFL — overall score out of 120 (or per-skill out of 30)
      if (score < 45) return AdaptiveLevel.easy;
      if (score <= 90) return AdaptiveLevel.medium;
      return AdaptiveLevel.hard;
    }
  }

  /// Number of IELTS missions shown per skill per level.
  /// TOEFL does not use this — the backend already returns the correct level set.
  static int getMissionCount(String skill, AdaptiveLevel level) {
    final skillKey = skill.toLowerCase();
    switch (skillKey) {
      case 'reading':
        return level == AdaptiveLevel.hard ? 3 : 4;
      case 'listening':
        return level == AdaptiveLevel.hard ? 2 : 3;
      case 'writing':
        return level == AdaptiveLevel.hard ? 4 : 5;
      case 'speaking':
        return level == AdaptiveLevel.hard ? 3 : 4;
      default:
        return 3;
    }
  }

  static String getBadgeLabel(AdaptiveLevel level) {
    switch (level) {
      case AdaptiveLevel.easy:
        return "Foundations";
      case AdaptiveLevel.medium:
        return "Strategic";
      case AdaptiveLevel.hard:
        return "Refined";
    }
  }

  /// Filters missions to show the right subset for the student's level.
  ///
  /// - **IELTS**: The backend returns the full catalog; we slice by [getMissionCount].
  /// - **TOEFL**: The backend already returns the exact level-specific missions;
  ///   we return them all without further filtering.
  static List<Mission> filterMissions(
    List<Mission> allMissions,
    String skill,
    AdaptiveLevel level, {
    String examType = 'IELTS',
  }) {
    if (examType.toUpperCase() == 'TOEFL') {
      // TOEFL missions are level-differentiated at the source — no client-side cut needed.
      return allMissions;
    }
    // IELTS: slice by adaptive count
    final count = getMissionCount(skill, level);
    return allMissions.take(count).toList();
  }
}
