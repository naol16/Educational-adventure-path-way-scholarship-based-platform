import 'package:flutter_riverpod/flutter_riverpod.dart';

enum ToeflStage { reading, listening, response }

class ToeflTaskState {
  final ToeflStage currentStage;
  final Duration stageTimeRemaining;
  final bool isRecording;
  final Map<String, dynamic> responses;
  final String? currentReadingPassage;
  final String? currentAudioUrl;

  ToeflTaskState({
    this.currentStage = ToeflStage.reading,
    this.stageTimeRemaining = const Duration(seconds: 45),
    this.isRecording = false,
    this.responses = const {},
    this.currentReadingPassage,
    this.currentAudioUrl,
  });

  ToeflTaskState copyWith({
    ToeflStage? currentStage,
    Duration? stageTimeRemaining,
    bool? isRecording,
    Map<String, dynamic>? responses,
    String? currentReadingPassage,
    String? currentAudioUrl,
  }) {
    return ToeflTaskState(
      currentStage: currentStage ?? this.currentStage,
      stageTimeRemaining: stageTimeRemaining ?? this.stageTimeRemaining,
      isRecording: isRecording ?? this.isRecording,
      responses: responses ?? this.responses,
      currentReadingPassage: currentReadingPassage ?? this.currentReadingPassage,
      currentAudioUrl: currentAudioUrl ?? this.currentAudioUrl,
    );
  }
}

class ToeflTaskNotifier extends StateNotifier<ToeflTaskState> {
  ToeflTaskNotifier() : super(ToeflTaskState());

  void setStage(ToeflStage stage, Duration duration) {
    state = state.copyWith(currentStage: stage, stageTimeRemaining: duration);
  }

  void updateTimer(Duration remaining) {
    state = state.copyWith(stageTimeRemaining: remaining);
  }

  void setRecording(bool recording) {
    state = state.copyWith(isRecording: recording);
  }

  void updateResponse(String taskId, dynamic response) {
    final newResponses = Map<String, dynamic>.from(state.responses);
    newResponses[taskId] = response;
    state = state.copyWith(responses: newResponses);
  }

  void resetTask(String passage, String? audioUrl) {
    state = ToeflTaskState(
      currentReadingPassage: passage,
      currentAudioUrl: audioUrl,
    );
  }
}

final toeflTaskProvider = StateNotifierProvider<ToeflTaskNotifier, ToeflTaskState>((ref) {
  return ToeflTaskNotifier();
});
