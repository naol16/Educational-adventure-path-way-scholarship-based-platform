import 'package:mobile/features/learning_path/models/learning_path.dart';

enum AdaptiveLevel { easy, medium, hard }

class AdaptivePathGenerator {
  static AdaptiveLevel calculateLevel(String examType, double score) {
    if (examType.toUpperCase() == 'IELTS') {
      if (score < 6.5) return AdaptiveLevel.easy;
      if (score < 7.5) return AdaptiveLevel.medium;
      return AdaptiveLevel.hard;
    } else {
      // TOEFL — overall score out of 120
      if (score < 85) return AdaptiveLevel.easy;
      if (score < 100) return AdaptiveLevel.medium;
      return AdaptiveLevel.hard;
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

  /// Returns missions for the student's current level.
  ///
  /// Both **IELTS** and **TOEFL** missions are now level-differentiated at the backend source,
  /// so this method simply returns the provided list without further filtering.
  static List<Mission> filterMissions(
    List<Mission> allMissions,
    String skill,
    AdaptiveLevel level, {
    String examType = 'IELTS',
  }) {
    // Both exams are level-differentiated at the source — no client-side cut needed.
    return allMissions;
  }
}
