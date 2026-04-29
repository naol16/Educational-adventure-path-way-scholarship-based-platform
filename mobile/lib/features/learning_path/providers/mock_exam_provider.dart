import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/providers/dependencies.dart';
import 'package:mobile/features/learning_path/models/assessment_model.dart';
import 'package:mobile/features/learning_path/services/assessment_api_service.dart';

enum MockExamView { dashboard, exam, grading, result, breakTime }

class MockExamState {
  final MockExamView view;
  final bool isGenerating;
  final bool isSubmitting;
  final bool isPolling;
  final AssessmentBlueprint? blueprint;
  final Map<String, dynamic> answers;
  final Set<String> completedSections;
  final int currentSectionIndex;
  final Duration timeRemaining;
  final Map<String, dynamic>? result;
  final List<Map<String, dynamic>> progressHistory;
  final bool isLoadingHistory;
  final String? error;
  final String? learningPathError;
  final String examType;
  final String difficulty;

  const MockExamState({
    this.view = MockExamView.dashboard,
    this.isGenerating = false,
    this.isSubmitting = false,
    this.isPolling = false,
    this.blueprint,
    this.answers = const {},
    this.completedSections = const {},
    this.currentSectionIndex = 0,
    this.timeRemaining = const Duration(minutes: 20),
    this.result,
    this.progressHistory = const [],
    this.isLoadingHistory = false,
    this.error,
    this.learningPathError,
    this.examType = 'IELTS',
    this.difficulty = 'Medium',
  });

  MockExamState copyWith({
    MockExamView? view,
    bool? isGenerating,
    bool? isSubmitting,
    bool? isPolling,
    AssessmentBlueprint? blueprint,
    Map<String, dynamic>? answers,
    Set<String>? completedSections,
    int? currentSectionIndex,
    Duration? timeRemaining,
    Map<String, dynamic>? result,
    List<Map<String, dynamic>>? progressHistory,
    bool? isLoadingHistory,
    String? error,
    String? learningPathError,
    String? examType,
    String? difficulty,
    bool clearError = false,
    bool clearLearningPathError = false,
  }) {
    return MockExamState(
      view: view ?? this.view,
      isGenerating: isGenerating ?? this.isGenerating,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      isPolling: isPolling ?? this.isPolling,
      blueprint: blueprint ?? this.blueprint,
      answers: answers ?? this.answers,
      completedSections: completedSections ?? this.completedSections,
      currentSectionIndex: currentSectionIndex ?? this.currentSectionIndex,
      timeRemaining: timeRemaining ?? this.timeRemaining,
      result: result ?? this.result,
      progressHistory: progressHistory ?? this.progressHistory,
      isLoadingHistory: isLoadingHistory ?? this.isLoadingHistory,
      error: clearError ? null : (error ?? this.error),
      learningPathError: clearLearningPathError ? null : (learningPathError ?? this.learningPathError),
      examType: examType ?? this.examType,
      difficulty: difficulty ?? this.difficulty,
    );
  }
}

class MockExamNotifier extends StateNotifier<MockExamState> {
  MockExamNotifier({required AssessmentApiService apiService})
      : _api = apiService,
        super(const MockExamState()) {
    loadHistory();
  }

  final AssessmentApiService _api;
  Timer? _sectionTimer;
  Timer? _pollTimer;

  static const Map<int, int> _sectionMinutes = {
    0: 20, // reading  (IELTS) / reading  (TOEFL 35min → use 35)
    1: 15, // listening (IELTS) / listening (TOEFL 36min → use 36)
    2: 40, // writing  (IELTS) / speaking  (TOEFL 16min → use 16)
    3: 15, // speaking (IELTS) / writing   (TOEFL 29min → use 29)
  };

  // TOEFL section order: Reading → Listening → Speaking → Writing
  // IELTS section order: Reading → Listening → Writing  → Speaking
  static const Map<String, Map<int, int>> _examSectionMinutes = {
    'IELTS': {0: 20, 1: 15, 2: 40, 3: 15},
    'TOEFL': {0: 35, 1: 36, 2: 16, 3: 29},
  };

  // TOEFL has a 10-min break between Listening (index 1) and Speaking (index 2)
  bool get _isToefl => state.examType == 'TOEFL';

  int _minutesForSection(int index) {
    final map = _examSectionMinutes[state.examType] ?? _examSectionMinutes['IELTS']!;
    return map[index] ?? 20;
  }

  Future<void> loadHistory() async {
    state = state.copyWith(isLoadingHistory: true);
    try {
      final data = await _api.getProgress();
      final raw = data['data'];
      final list = (raw is List) ? raw.cast<Map<String, dynamic>>() : <Map<String, dynamic>>[];
      state = state.copyWith(progressHistory: list, isLoadingHistory: false);
    } catch (_) {
      state = state.copyWith(isLoadingHistory: false);
    }
  }

  void setExamType(String type) => state = state.copyWith(examType: type);
  void setDifficulty(String d) => state = state.copyWith(difficulty: d);

  Future<void> generateExam() async {
    state = state.copyWith(isGenerating: true, clearError: true, clearLearningPathError: true);
    try {
      final blueprint = await _api.generate(
        examType: state.examType,
        difficulty: state.difficulty,
      );
      state = state.copyWith(
        isGenerating: false,
        blueprint: blueprint,
        answers: {},
        completedSections: {},
        currentSectionIndex: 0,
        view: MockExamView.exam,
        timeRemaining: Duration(minutes: _minutesForSection(0)),
      );
      _startSectionTimer();
    } catch (e) {
      final msg = e.toString();
      if (msg.contains('403') || msg.contains('learning path') || msg.contains('100%')) {
        state = state.copyWith(
          isGenerating: false,
          learningPathError: 'Complete 100% of your learning path to unlock the mock exam.',
        );
      } else {
        state = state.copyWith(isGenerating: false, error: 'Failed to generate exam. Please try again.');
      }
    }
  }

  void _startSectionTimer() {
    _sectionTimer?.cancel();
    final minutes = _minutesForSection(state.currentSectionIndex);
    state = state.copyWith(timeRemaining: Duration(minutes: minutes));
    _sectionTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      final remaining = state.timeRemaining - const Duration(seconds: 1);
      if (remaining.inSeconds <= 0) {
        _sectionTimer?.cancel();
        state = state.copyWith(timeRemaining: Duration.zero);
      } else {
        state = state.copyWith(timeRemaining: remaining);
      }
    });
  }

  void goToSection(int index) {
    _markCurrentSectionComplete();
    _sectionTimer?.cancel();
    // TOEFL: show 10-min break between Listening (1) and Speaking (2)
    if (_isToefl && state.currentSectionIndex == 1 && index == 2) {
      state = state.copyWith(
        currentSectionIndex: index,
        view: MockExamView.breakTime,
        timeRemaining: const Duration(minutes: 10),
      );
      _startBreakTimer();
      return;
    }
    state = state.copyWith(currentSectionIndex: index, view: MockExamView.exam);
    _startSectionTimer();
  }

  void _startBreakTimer() {
    _sectionTimer?.cancel();
    state = state.copyWith(timeRemaining: const Duration(minutes: 10));
    _sectionTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      final remaining = state.timeRemaining - const Duration(seconds: 1);
      if (remaining.inSeconds <= 0) {
        _sectionTimer?.cancel();
        endBreak();
      } else {
        state = state.copyWith(timeRemaining: remaining);
      }
    });
  }

  void endBreak() {
    _sectionTimer?.cancel();
    state = state.copyWith(view: MockExamView.exam);
    _startSectionTimer();
  }

  void nextSection() {
    if (state.currentSectionIndex < 3) goToSection(state.currentSectionIndex + 1);
  }

  void previousSection() {
    // TOEFL Listening: no going back once you advance
    if (_isToefl && state.currentSectionIndex == 1) return;
    if (state.currentSectionIndex > 0) goToSection(state.currentSectionIndex - 1);
  }

  void _markCurrentSectionComplete() {
    final sectionNames = ['reading', 'listening', 'writing', 'speaking'];
    final current = sectionNames[state.currentSectionIndex];
    final updated = Set<String>.from(state.completedSections)..add(current);
    state = state.copyWith(completedSections: updated);
  }

  void updateAnswer(String key, dynamic value) {
    final updated = Map<String, dynamic>.from(state.answers)..[key] = value;
    state = state.copyWith(answers: updated);
  }

  Future<void> submitExam() async {
    _sectionTimer?.cancel();
    _markCurrentSectionComplete();
    state = state.copyWith(isSubmitting: true, clearError: true);
    try {
      final bp = state.blueprint!;
      final responses = _buildResponses();
      final audioBytes = state.answers['speaking_audio'] as List<int>?;
      await _api.submit(testId: bp.testId, responses: responses, audioBytes: audioBytes);
      state = state.copyWith(isSubmitting: false, isPolling: true, view: MockExamView.grading);
      _startPolling(bp.testId);
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: 'Submission failed. Please try again.');
    }
  }

  Map<String, dynamic> _buildResponses() {
    final reading = <String, dynamic>{};
    final listening = <String, dynamic>{};
    for (final entry in state.answers.entries) {
      if (entry.key.startsWith('R_')) reading[entry.key.substring(2)] = entry.value;
      else if (entry.key.startsWith('L_')) listening[entry.key.substring(2)] = entry.value;
    }
    return {
      'reading': reading,
      'listening': listening,
      'writing': state.answers['writing'] ?? '',
      'speaking': state.answers['speaking_text'] ?? '',
    };
  }

  void _startPolling(String testId) {
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(const Duration(seconds: 3), (_) async {
      try {
        final res = await _api.getResult(testId);
        final status = res['status'];
        if (status == 'success') {
          _pollTimer?.cancel();
          state = state.copyWith(isPolling: false, result: res, view: MockExamView.result);
          loadHistory();
        } else if (status == 'failed') {
          _pollTimer?.cancel();
          state = state.copyWith(isPolling: false, error: 'Evaluation failed.', view: MockExamView.dashboard);
        }
      } catch (_) {}
    });
  }

  void backToDashboard() {
    _sectionTimer?.cancel();
    _pollTimer?.cancel();
    state = state.copyWith(
      view: MockExamView.dashboard,
      blueprint: null,
      answers: {},
      completedSections: {},
      currentSectionIndex: 0,
      result: null,
      clearError: true,
    );
    loadHistory();
  }

  @override
  void dispose() {
    _sectionTimer?.cancel();
    _pollTimer?.cancel();
    super.dispose();
  }
}

final mockExamProvider = StateNotifierProvider<MockExamNotifier, MockExamState>((ref) {
  return MockExamNotifier(apiService: ref.watch(assessmentApiServiceProvider));
});
