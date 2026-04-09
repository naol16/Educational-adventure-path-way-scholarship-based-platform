import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../../providers/dependencies.dart';

class InterviewState {
  final bool isLoading;
  final String? error;
  final dynamic testData;
  final String currentPrompt;
  final bool isRecording;
  final bool isSending;

  InterviewState({
    this.isLoading = false,
    this.error,
    this.testData,
    this.currentPrompt = "Press the mic and start speaking your response.",
    this.isRecording = false,
    this.isSending = false,
  });

  InterviewState copyWith({
    bool? isLoading,
    String? error,
    dynamic testData,
    String? currentPrompt,
    bool? isRecording,
    bool? isSending,
  }) {
    return InterviewState(
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      testData: testData ?? this.testData,
      currentPrompt: currentPrompt ?? this.currentPrompt,
      isRecording: isRecording ?? this.isRecording,
      isSending: isSending ?? this.isSending,
    );
  }
}

class InterviewProvider extends StateNotifier<InterviewState> {
  final Ref ref;

  InterviewProvider(this.ref) : super(InterviewState());

  Future<void> generateTest({String examType = 'IELTS', String difficulty = 'easy'}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final token = await ref.read(tokenStorageProvider).readAccessToken();
      if (token == null) throw Exception('Not authenticated');

      final res = await http.post(
        Uri.parse('http://10.0.2.2:5000/api/assessment/generate'), // Adjust for iOS vs Android
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'examType': examType,
          'difficulty': difficulty,
        }),
      );

      if (res.statusCode == 201) {
        final data = jsonDecode(res.body);
        String initialPrompt = "Describe a time when you had to work with a difficult person.";
        
        // Extract prompt if backend provides initial speaking questions
        if (data != null && data['questions'] != null && data['questions'].isNotEmpty) {
           initialPrompt = data['questions'][0]['question_text'] ?? initialPrompt;
        }

        state = state.copyWith(isLoading: false, testData: data, currentPrompt: initialPrompt);
      } else {
        throw Exception(res.body);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void toggleRecording(bool isRecording) {
    state = state.copyWith(isRecording: isRecording);
  }

  Future<void> submitAudio(String filePath) async {
    state = state.copyWith(isSending: true, error: null);
    try {
      final token = await ref.read(tokenStorageProvider).readAccessToken();
      if (token == null) throw Exception('Not authenticated');

      final testId = state.testData?['test_id'];
      if (testId == null) throw Exception('No test generated');

      var request = http.MultipartRequest('POST', Uri.parse('http://10.0.2.2:5000/api/assessment/submit'));
      request.headers['Authorization'] = 'Bearer $token';
      
      request.fields['test_id'] = testId;
      request.fields['responses'] = jsonEncode([{"section": "Speaking", "text": "Audio attached."}]);
      
      request.files.add(await http.MultipartFile.fromPath('audio', filePath));

      final streamedResponse = await request.send();
      final res = await http.Response.fromStream(streamedResponse);

      if (res.statusCode == 200 || res.statusCode == 201) {
        state = state.copyWith(isSending: false, currentPrompt: "Analysis complete! Check your dashboard for the band score.");
      } else {
        throw Exception(res.body);
      }
    } catch (e) {
      state = state.copyWith(isSending: false, error: e.toString());
    }
  }
}

final interviewProvider = StateNotifierProvider<InterviewProvider, InterviewState>((ref) {
  return InterviewProvider(ref);
});
