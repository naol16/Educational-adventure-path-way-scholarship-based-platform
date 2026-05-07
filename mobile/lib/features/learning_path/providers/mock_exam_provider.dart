import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:mobile/features/learning_path/models/assessment_model.dart';
import 'package:mobile/features/learning_path/services/assessment_api_service.dart';
import 'package:mobile/features/learning_path/screens/mock_exam/mock_exam_haptics.dart';
import 'package:mobile/core/providers/dependencies.dart';

enum MockExamView { dashboard, overview, exam, grading, result, breakTime }

enum ToeflSubStage { instruction, reading, listening, preparing, responding }

class MockExamState {
  final MockExamView view;
  final String examType; // 'IELTS' or 'TOEFL'
  final AssessmentBlueprint? blueprint;
  final int currentSectionIndex; // IELTS: L(0),R(1),W(2),S(3) | TOEFL: R(0),L(1),S(2),W(3)
  final int currentQuestionIndex;
  final Map<String, dynamic> answers;
  final Map<int, bool> flaggedQuestions;
  final List<Map<String, int>> highlights;
  final String? notes; // Persistent notes for Listening/TOEFL
  final Duration timeRemaining;
  final bool isSubmitting;
  final Map<String, dynamic>? result;
  final String attemptId;
  final bool isTransferTime;
  final String testType; // 'Academic' or 'General'
  final bool isReviewMode;
  final String difficulty;
  final List<Map<String, dynamic>> progressHistory;
  final bool isLoadingHistory;
  final bool isGenerating;
  final String? error;
  final String? learningPathError;
  
  // TOEFL specific
  final ToeflSubStage toeflSubStage;

  const MockExamState({
    this.view = MockExamView.dashboard,
    this.examType = 'IELTS',
    this.blueprint,
    this.currentSectionIndex = 0,
    this.currentQuestionIndex = 0,
    this.answers = const {},
    this.flaggedQuestions = const {},
    this.highlights = const [],
    this.notes,
    this.timeRemaining = Duration.zero,
    this.isSubmitting = false,
    this.result,
    this.attemptId = '',
    this.isTransferTime = false,
    this.testType = 'Academic',
    this.isReviewMode = false,
    this.difficulty = 'Medium',
    this.progressHistory = const [],
    this.isLoadingHistory = false,
    this.isGenerating = false,
    this.error,
    this.learningPathError,
    this.toeflSubStage = ToeflSubStage.instruction,
  });

  MockExamState copyWith({
    MockExamView? view,
    String? examType,
    AssessmentBlueprint? blueprint,
    int? currentSectionIndex,
    int? currentQuestionIndex,
    Map<String, dynamic>? answers,
    Map<int, bool>? flaggedQuestions,
    List<Map<String, int>>? highlights,
    String? notes,
    Duration? timeRemaining,
    bool? isSubmitting,
    Map<String, dynamic>? result,
    String? attemptId,
    bool? isTransferTime,
    String? testType,
    bool? isReviewMode,
    String? difficulty,
    List<Map<String, dynamic>>? progressHistory,
    bool? isLoadingHistory,
    bool? isGenerating,
    String? error,
    bool clearError = false,
    String? learningPathError,
    bool clearLearningPathError = false,
    ToeflSubStage? toeflSubStage,
  }) {
    return MockExamState(
      view: view ?? this.view,
      examType: examType ?? this.examType,
      blueprint: blueprint ?? this.blueprint,
      currentSectionIndex: currentSectionIndex ?? this.currentSectionIndex,
      currentQuestionIndex: currentQuestionIndex ?? this.currentQuestionIndex,
      answers: answers ?? this.answers,
      flaggedQuestions: flaggedQuestions ?? this.flaggedQuestions,
      highlights: highlights ?? this.highlights,
      notes: notes ?? this.notes,
      timeRemaining: timeRemaining ?? this.timeRemaining,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      result: result ?? this.result,
      attemptId: attemptId ?? this.attemptId,
      isTransferTime: isTransferTime ?? this.isTransferTime,
      testType: testType ?? this.testType,
      isReviewMode: isReviewMode ?? this.isReviewMode,
      difficulty: difficulty ?? this.difficulty,
      progressHistory: progressHistory ?? this.progressHistory,
      isLoadingHistory: isLoadingHistory ?? this.isLoadingHistory,
      isGenerating: isGenerating ?? this.isGenerating,
      error: clearError ? null : (error ?? this.error),
      learningPathError: clearLearningPathError ? null : (learningPathError ?? this.learningPathError),
      toeflSubStage: toeflSubStage ?? this.toeflSubStage,
    );
  }

  // Design Tokens based on Exam Type
  Color get primaryAccent => examType == 'TOEFL' ? const Color(0xFF6366F1) : const Color(0xFF10B981);
  
  bool get isListening => examType == 'TOEFL' ? currentSectionIndex == 1 : currentSectionIndex == 0;
  bool get isReading => examType == 'TOEFL' ? currentSectionIndex == 0 : currentSectionIndex == 1;
  bool get isWriting => currentSectionIndex == 2;
  bool get isSpeaking => currentSectionIndex == 3;

  List<String> get sectionLabels => examType == 'TOEFL' 
      ? ['Reading', 'Listening', 'Speaking', 'Writing']
      : ['Listening', 'Reading', 'Writing', 'Speaking'];

  int get totalObjectiveQuestions {
    if (blueprint == null) return 0;
    if (isListening) return blueprint!.sections.listening?.questions.length ?? 0;
    if (isReading) return blueprint!.sections.reading?.questions.length ?? 0;
    return 0;
  }

  int get answeredObjectiveQuestions {
    final prefix = isListening ? 'L_' : (isReading ? 'R_' : '');
    if (prefix.isEmpty) return 0;
    return answers.keys.where((k) => k.startsWith(prefix)).length;
  }

  Map<String, dynamic> toJson() => {
    'view': view.index,
    'examType': examType,
    'blueprint': blueprint?.toJson(),
    'currentSectionIndex': currentSectionIndex,
    'currentQuestionIndex': currentQuestionIndex,
    'answers': answers,
    'flaggedQuestions': flaggedQuestions.map((k, v) => MapEntry(k.toString(), v)),
    'highlights': highlights,
    'notes': notes,
    'timeRemaining': timeRemaining.inSeconds,
    'attemptId': attemptId,
    'testType': testType,
    'difficulty': difficulty,
    'toeflSubStage': toeflSubStage.index,
  };

  factory MockExamState.fromJson(Map<String, dynamic> json) {
    return MockExamState(
      view: MockExamView.values[json['view'] ?? 0],
      examType: json['examType'] ?? 'IELTS',
      blueprint: json['blueprint'] != null ? AssessmentBlueprint.fromJson(json['blueprint']) : null,
      currentSectionIndex: json['currentSectionIndex'] ?? 0,
      currentQuestionIndex: json['currentQuestionIndex'] ?? 0,
      answers: Map<String, dynamic>.from(json['answers'] ?? {}),
      flaggedQuestions: (json['flaggedQuestions'] as Map?)?.map((k, v) => MapEntry(int.parse(k), v as bool)) ?? {},
      highlights: (json['highlights'] as List?)?.map((e) => Map<String, int>.from(e)).toList() ?? [],
      notes: json['notes'],
      timeRemaining: Duration(seconds: json['timeRemaining'] ?? 0),
      attemptId: json['attemptId'] ?? '',
      testType: json['testType'] ?? 'Academic',
      difficulty: json['difficulty'] ?? 'Medium',
      toeflSubStage: ToeflSubStage.values[json['toeflSubStage'] ?? 0],
    );
  }
}

class MockExamNotifier extends StateNotifier<MockExamState> {
  final AssessmentApiService _api;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  Timer? _timer;
  Timer? _persistTimer;

  MockExamNotifier(this._api) : super(const MockExamState()) {
    _restoreState();
    loadHistory();
  }

  // --- Persistence ---
  Future<void> _restoreState() async {
    try {
      final saved = await _storage.read(key: 'mock_exam_state_v2');
      if (saved != null) {
        state = MockExamState.fromJson(jsonDecode(saved));
        if (state.view == MockExamView.exam || state.view == MockExamView.breakTime) {
          _startTimer();
          _startPersistenceTimer();
        }
      }
    } catch (e) {
      debugPrint("Restore error: $e");
    }
  }

  void _startPersistenceTimer() {
    _persistTimer?.cancel();
    _persistTimer = Timer.periodic(const Duration(seconds: 30), (_) => _saveState());
  }

  Future<void> _saveState() async {
    await _storage.write(key: 'mock_exam_state_v2', value: jsonEncode(state.toJson()));
  }

  // --- History ---
  Future<void> loadHistory() async {
    state = state.copyWith(isLoadingHistory: true);
    try {
      final data = await _api.getProgress();
      final list = (data['data'] as List?)?.cast<Map<String, dynamic>>() ?? [];
      state = state.copyWith(progressHistory: list, isLoadingHistory: false);
    } catch (_) {
      state = state.copyWith(isLoadingHistory: false);
    }
  }

  // --- Configuration ---
  void setExamType(String type) => state = state.copyWith(examType: type);
  void setTestType(String type) => state = state.copyWith(testType: type);
  void setDifficulty(String d) => state = state.copyWith(difficulty: d);

  Future<void> generateExam() async {
    state = state.copyWith(isGenerating: true, clearError: true, clearLearningPathError: true);
    try {
      final blueprint = await _api.generate(examType: state.examType, difficulty: state.difficulty);
      state = state.copyWith(isGenerating: false, blueprint: blueprint, view: MockExamView.overview);
    } catch (e) {
      final msg = e.toString();
      if (msg.contains('403') || msg.contains('learning path')) {
        state = state.copyWith(isGenerating: false, learningPathError: "Complete 100% of your learning path to unlock.");
      } else {
        state = state.copyWith(isGenerating: false, error: "Failed to generate exam.");
      }
    }
  }

  void startExam() {
    final blueprint = state.blueprint;
    if (blueprint == null) return;

    final attemptId = "${state.examType}-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}";
    
    // Initial Section Duration
    final initialDuration = state.examType == 'TOEFL' 
        ? const Duration(minutes: 35) // Reading
        : const Duration(minutes: 30); // Listening

    state = state.copyWith(
      view: MockExamView.exam,
      attemptId: attemptId,
      timeRemaining: initialDuration,
      currentSectionIndex: 0,
      currentQuestionIndex: 0,
      toeflSubStage: state.examType == 'TOEFL' ? ToeflSubStage.reading : ToeflSubStage.instruction,
    );
    _startTimer();
    _startPersistenceTimer();
    MockExamHaptics.sectionComplete();
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) => _onTick());
  }

  void _onTick() {
    if (state.timeRemaining.inSeconds <= 0) {
      if (state.view == MockExamView.breakTime) {
        endBreak();
      } else {
        forceSubmit();
      }
      return;
    }

    state = state.copyWith(timeRemaining: state.timeRemaining - const Duration(seconds: 1));
    if (state.timeRemaining.inSeconds <= 10 && state.timeRemaining.inSeconds > 0) {
      MockExamHaptics.tickTock();
    }
  }

  // --- Navigation & State ---
  void nextQuestion() {
    final total = state.totalObjectiveQuestions;
    if (state.currentQuestionIndex < total - 1) {
      state = state.copyWith(currentQuestionIndex: state.currentQuestionIndex + 1);
    } else {
      nextSection();
    }
  }

  void prevQuestion() {
    if (state.currentQuestionIndex > 0) {
      state = state.copyWith(currentQuestionIndex: state.currentQuestionIndex - 1);
    }
  }

  void jumpToQuestion(int index) => state = state.copyWith(currentQuestionIndex: index);

  void updateAnswer(String key, dynamic value) {
    final answers = Map<String, dynamic>.from(state.answers);
    answers[key] = value;
    state = state.copyWith(answers: answers);
  }

  void flagQuestion(int index) {
    final flags = Map<int, bool>.from(state.flaggedQuestions);
    flags[index] = !(flags[index] ?? false);
    state = state.copyWith(flaggedQuestions: flags);
    MockExamHaptics.success();
  }

  void updateNotes(String val) => state = state.copyWith(notes: val);

  void addHighlight(int start, int end) {
    final highlights = List<Map<String, int>>.from(state.highlights);
    highlights.add({'start': start, 'end': end});
    state = state.copyWith(highlights: highlights);
  }

  void nextSection() {
    if (state.currentSectionIndex < 3) {
      _timer?.cancel();
      state = state.copyWith(
        view: MockExamView.breakTime,
        timeRemaining: const Duration(seconds: 60),
      );
      MockExamHaptics.sectionComplete();
    } else {
      submitExam();
    }
  }

  void endBreak() {
    final nextIdx = state.currentSectionIndex + 1;
    Duration nextDuration;
    
    if (state.examType == 'TOEFL') {
      nextDuration = switch (nextIdx) {
        1 => const Duration(minutes: 36), // Listening
        2 => const Duration(minutes: 16), // Speaking
        3 => const Duration(minutes: 29), // Writing
        _ => Duration.zero,
      };
    } else {
      nextDuration = switch (nextIdx) {
        1 => const Duration(minutes: 60), // Reading
        2 => const Duration(minutes: 60), // Writing
        3 => const Duration(minutes: 14), // Speaking
        _ => Duration.zero,
      };
    }

    state = state.copyWith(
      view: MockExamView.exam,
      currentSectionIndex: nextIdx,
      currentQuestionIndex: 0,
      timeRemaining: nextDuration,
      toeflSubStage: state.examType == 'TOEFL' ? ToeflSubStage.instruction : ToeflSubStage.instruction,
    );
    _startTimer();
  }

  void advanceToeflStage(ToeflSubStage next) {
    state = state.copyWith(toeflSubStage: next);
  }

  Future<void> submitExam() async {
    state = state.copyWith(view: MockExamView.grading, isSubmitting: true);
    _timer?.cancel();
    _persistTimer?.cancel();

    try {
      final responses = {
        'answers': state.answers,
        'notes': state.notes,
        'attemptId': state.attemptId,
        'examType': state.examType,
      };
      final result = await _api.submit(testId: state.blueprint!.testId, responses: responses);
      state = state.copyWith(view: MockExamView.result, result: result, isSubmitting: false);
      await _storage.delete(key: 'mock_exam_state_v2');
    } catch (e) {
      state = state.copyWith(isSubmitting: false);
    }
  }

  void forceSubmit() => submitExam();
  void backToDashboard() {
    state = state.copyWith(view: MockExamView.dashboard);
    _timer?.cancel();
    _persistTimer?.cancel();
  }
  void toggleReviewMode() => state = state.copyWith(isReviewMode: !state.isReviewMode);

  @override
  void dispose() {
    _timer?.cancel();
    _persistTimer?.cancel();
    super.dispose();
  }
}

final mockExamProvider = StateNotifierProvider<MockExamNotifier, MockExamState>((ref) {
  final api = ref.watch(assessmentApiServiceProvider);
  return MockExamNotifier(api);
});
