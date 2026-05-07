import 'package:flutter/services.dart';

/// Haptic feedback utility for the Mock Exam module.
/// Provides exam-specific haptic patterns for an immersive experience.
class MockExamHaptics {
  /// Subtle tick-tock vibration for the last 10 seconds of a section timer.
  /// Called once per second during the countdown.
  static void tickTock() {
    HapticFeedback.selectionClick();
  }

  /// Celebratory "thump" when the student hits the word count target in Writing.
  static void success() {
    HapticFeedback.heavyImpact();
  }

  /// Medium impact when a section is completed / submitted.
  static void sectionComplete() {
    HapticFeedback.mediumImpact();
  }

  /// Light tap for question navigation / pill tap.
  static void lightTap() {
    HapticFeedback.lightImpact();
  }

  /// Flag toggle feedback.
  static void flagToggle() {
    HapticFeedback.selectionClick();
  }
}
