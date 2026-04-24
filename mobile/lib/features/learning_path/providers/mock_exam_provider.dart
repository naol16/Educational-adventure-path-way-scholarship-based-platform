import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/providers/dependencies.dart';
import 'package:mobile/features/learning_path/models/assessment_model.dart';
import 'package:mobile/features/learning_path/services/assessment_api_service.dart';

class MockExamState {
  final bool isLoading;
  final bool isSubmitting;
  final AssessmentBlueprint? blueprint;
  final Map<String, dynamic> answers;
  final Set<String> reviewedQuestions;
  final int currentSectionIndex;
  final Duration timeRemaining;
  final bool isSubmitted;
  final Map<String, dynamic>? result;
  final String? error;

  MockExamState({
    this.isLoading = false,
    this.isSubmitting = false,
    this.blueprint,
    this.answers = const {},
    this.reviewedQuestions = const {},
    this.currentSectionIndex = 0,
    this.timeRemaining = const Duration(hours: 2, minutes: 40),
    this.isSubmitted = false,
    this.result,
    this.error,
  });

  MockExamState copyWith({
    bool? isLoading,
    bool? isSubmitting,
    AssessmentBlueprint? blueprint,
    Map<String, dynamic>? answers,
    Set<String>? reviewedQuestions,
    int? currentSectionIndex,
    Duration? timeRemaining,
    bool? isSubmitted,
    Map<String, dynamic>? result,
    String? error,
  }) {
    return MockExamState(
      isLoading: isLoading ?? this.isLoading,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      blueprint: blueprint ?? this.blueprint,
      answers: answers ?? this.answers,
      reviewedQuestions: reviewedQuestions ?? this.reviewedQuestions,
      currentSectionIndex: currentSectionIndex ?? this.currentSectionIndex,
      timeRemaining: timeRemaining ?? this.timeRemaining,
      isSubmitted: isSubmitted ?? this.isSubmitted,
      result: result ?? this.result,
      error: error ?? this.error,
    );
  }
}

class MockExamNotifier extends StateNotifier<MockExamState> {
  MockExamNotifier({required AssessmentApiService apiService}) 
    : _api = apiService, 
      super(MockExamState());

  final AssessmentApiService _api;

  void setBlueprint(AssessmentBlueprint blueprint) {
    state = state.copyWith(blueprint: blueprint);
  }

  void updateAnswer(String questionId, dynamic answer) {
    final newAnswers = Map<String, dynamic>.from(state.answers);
    newAnswers[questionId] = answer;
    state = state.copyWith(answers: newAnswers);
  }

  void toggleReview(String questionId) {
    final newReviewed = Set<String>.from(state.reviewedQuestions);
    if (newReviewed.contains(questionId)) {
      newReviewed.remove(questionId);
    } else {
      newReviewed.add(questionId);
    }
    state = state.copyWith(reviewedQuestions: newReviewed);
  }

  void nextSection() {
    if (state.currentSectionIndex < 3) {
      state = state.copyWith(currentSectionIndex: state.currentSectionIndex + 1);
    }
  }

  void previousSection() {
    if (state.currentSectionIndex > 0) {
      state = state.copyWith(currentSectionIndex: state.currentSectionIndex - 1);
    }
  }

  void updateTimer(Duration remaining) {
    state = state.copyWith(timeRemaining: remaining);
  }

  Future<void> submitFullExam() async {
    if (state.blueprint == null) return;
    
    state = state.copyWith(isSubmitting: true, error: null);
    try {
      final submissionResult = await _api.submit(
        testId: state.blueprint!.testId,
        responses: state.answers,
      );
      state = state.copyWith(
        isSubmitting: false, 
        isSubmitted: true,
        result: submissionResult,
      );
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString());
    }
  }
}

final mockExamProvider = StateNotifierProvider<MockExamNotifier, MockExamState>((ref) {
  return MockExamNotifier(
    apiService: ref.watch(assessmentApiServiceProvider),
  );
});
