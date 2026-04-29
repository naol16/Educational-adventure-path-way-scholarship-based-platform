import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/services/token_storage.dart';
import 'package:mobile/models/models.dart';
import 'package:mobile/features/learning_path/services/learning_path_api_service.dart';
import 'package:mobile/core/providers/dependencies.dart';

class LearningPathState {
  final FormattedLearningPath? ieltsPath;
  final FormattedLearningPath? toeflPath;
  final String activeExam; // 'IELTS' or 'TOEFL'
  final bool isLoading;

  LearningPathState({
    this.ieltsPath,
    this.toeflPath,
    this.activeExam = 'IELTS',
    this.isLoading = false,
  });

  FormattedLearningPath? get activePath => activeExam == 'IELTS' ? ieltsPath : toeflPath;

  LearningPathState copyWith({
    FormattedLearningPath? ieltsPath,
    FormattedLearningPath? toeflPath,
    String? activeExam,
    bool? isLoading,
  }) {
    return LearningPathState(
      ieltsPath: ieltsPath ?? this.ieltsPath,
      toeflPath: toeflPath ?? this.toeflPath,
      activeExam: activeExam ?? this.activeExam,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class LearningPathNotifier extends StateNotifier<LearningPathState> {
  LearningPathNotifier({required LearningPathApiService api, required TokenStorage storage})
      : _api = api,
        _storage = storage,
        super(LearningPathState());

  final LearningPathApiService _api;
  final TokenStorage _storage;

  /// Loads both IELTS and TOEFL paths in parallel on startup.
  Future<void> init() async {
    state = state.copyWith(isLoading: true);

    // Fetch both exam paths concurrently — each is a separate DB row.
    final results = await Future.wait([
      _api.fetchMyPath(examType: 'IELTS').catchError((_) => null),
      _api.fetchMyPath(examType: 'TOEFL').catchError((_) => null),
    ]);

    final ieltsPath = results[0];
    final toeflPath = results[1];

    // Activate whichever path was most recently created (has content).
    // Priority: IELTS first if both exist; otherwise whichever is non-null.
    String activeExam = 'IELTS';
    if (ieltsPath == null && toeflPath != null) {
      activeExam = 'TOEFL';
    } else if (ieltsPath != null) {
      activeExam = 'IELTS';
    }

    state = state.copyWith(
      ieltsPath: ieltsPath,
      toeflPath: toeflPath,
      activeExam: activeExam,
      isLoading: false,
    );
  }

  /// Switches the active exam tab and fetches that path if not already loaded.
  Future<void> switchExam(String examType) async {
    final upper = examType.toUpperCase();
    state = state.copyWith(activeExam: upper);

    // Fetch the target path if we don't have it yet (lazy load).
    final alreadyLoaded = upper == 'IELTS' ? state.ieltsPath : state.toeflPath;
    if (alreadyLoaded == null) {
      state = state.copyWith(isLoading: true);
      try {
        final path = await _api.fetchMyPath(examType: upper);
        if (upper == 'IELTS') {
          state = state.copyWith(ieltsPath: path, isLoading: false);
        } else {
          state = state.copyWith(toeflPath: path, isLoading: false);
        }
      } catch (_) {
        state = state.copyWith(isLoading: false);
      }
    }
  }

  /// Reloads only the currently active exam's path from the server.
  Future<void> reload() async {
    state = state.copyWith(isLoading: true);
    try {
      final path = await _api.fetchMyPath(examType: state.activeExam);
      if (state.activeExam == 'IELTS') {
        state = state.copyWith(ieltsPath: path, isLoading: false);
      } else {
        state = state.copyWith(toeflPath: path, isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> markProgress({
    int? videoId,
    int? pdfId,
    required String section,
    bool isCompleted = true,
    bool isNote = false,
    int? questionIndex,
  }) async {
    try {
      await _api.markComplete(
        videoId: videoId,
        pdfId: pdfId,
        section: section,
        isCompleted: isCompleted,
        isNote: isNote,
        questionIndex: questionIndex,
      );

      // Silently refresh only the active exam's path.
      final newData = await _api.fetchMyPath(examType: state.activeExam);
      if (newData != null) {
        if (newData.examType.toUpperCase() == 'IELTS') {
          state = state.copyWith(ieltsPath: newData);
        } else {
          state = state.copyWith(toeflPath: newData);
        }
      }
    } catch (e) {
      print("Error marking progress: $e");
    }
  }

  Future<void> completeResource(int resourceId, String section) async {
    await markProgress(videoId: resourceId, section: section, isCompleted: true);
  }

  Future<void> completePdf(int pdfId, String section) async {
    await markProgress(pdfId: pdfId, section: section, isCompleted: true);
  }
}

final learningPathProvider =
    StateNotifierProvider<LearningPathNotifier, LearningPathState>((ref) {
  final api = ref.watch(learningPathApiServiceProvider);
  final storage = ref.watch(tokenStorageProvider);
  return LearningPathNotifier(api: api, storage: storage)..init();
});







