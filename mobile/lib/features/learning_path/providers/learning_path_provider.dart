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

  Future<void> init() async {
    state = state.copyWith(isLoading: true);
    final savedExam = await _storage.readSelectedExam();
    
    // We try to fetch both if they exist
    final path = await _api.fetchMyPath();
    
    if (path != null) {
      if (path.examType.toUpperCase() == 'IELTS') {
        state = state.copyWith(
          ieltsPath: path,
          activeExam: savedExam ?? 'IELTS',
          isLoading: false,
        );
      } else {
        state = state.copyWith(
          toeflPath: path,
          activeExam: savedExam ?? 'TOEFL',
          isLoading: false,
        );
      }
    } else {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> switchExam(String examType) async {
    state = state.copyWith(activeExam: examType);
    await _storage.writeSelectedExam(examType);
    // Reload active path to ensure it's fresh
    await reload();
  }

  Future<void> reload() async {
    state = state.copyWith(isLoading: true);
    try {
      final path = await _api.fetchMyPath(); // Backend should return based on user profile or we might need specific param
      if (path != null) {
        if (path.examType.toUpperCase() == 'IELTS') {
          state = state.copyWith(ieltsPath: path, isLoading: false);
        } else {
          state = state.copyWith(toeflPath: path, isLoading: false);
        }
      } else {
        state = state.copyWith(isLoading: false);
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
      
      // Refresh data silently
      final newData = await _api.fetchMyPath();
      if (newData != null) {
        if (newData.examType.toUpperCase() == 'IELTS') {
          state = state.copyWith(ieltsPath: newData);
        } else {
          state = state.copyWith(toeflPath: newData);
        }
      }
    } catch (e) {
      // If refresh fails, we can either keep old state or show error
      // For progress, let's just log it and keep current state
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







