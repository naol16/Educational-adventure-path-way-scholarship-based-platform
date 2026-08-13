import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:mobile/core/services/api_client.dart';
import 'package:mobile/core/services/http_helpers.dart';
import 'package:mobile/features/learning_path/models/assessment_model.dart';

// The provider is already defined in mobile/core/providers/dependencies.dart
// DO NOT re-define assessmentApiServiceProvider here.

class AssessmentApiService {
  AssessmentApiService({required ApiClient apiClient}) : _api = apiClient;

  final ApiClient _api;

  Future<AssessmentBlueprint> generate({
    required String examType,
    String difficulty = 'Medium',
    bool force = false,
  }) async {
    final response = await _api.post(
      '/api/assessment/generate',
      auth: true,
      body: {
        'examType': examType,
        'difficulty': difficulty,
        'force': force,
      },
    );

    if (response.statusCode != 201) {
      throwForResponse(response, fallback: 'Failed to generate assessment');
    }

    final root = decodeJsonObject(response);
    return AssessmentBlueprint.fromJson(root);
  }

  Future<Map<String, dynamic>> submit({
    required String testId,
    required Map<String, dynamic> responses,
    List<int>? audioBytes,
    String? audioMimeType,
  }) async {
    final fields = {'test_id': testId, 'responses': jsonEncode(responses)};

    List<http.MultipartFile>? files;
    if (audioBytes != null) {
      files = [
        http.MultipartFile.fromBytes(
          'audio',
          audioBytes,
          filename: 'speaking_response.m4a',
          contentType: MediaType('audio', 'aac'),
        ),
      ];
    }

    final response = await _api.postMultipart(
      '/api/assessment/submit',
      auth: true,
      fields: fields,
      files: files,
    );

    if (response.statusCode != 200) {
      throwForResponse(response, fallback: 'Failed to submit assessment');
    }

    return decodeJsonObject(response);
  }

  Future<Map<String, dynamic>> submitSection({
    required String testId,
    required String skill,
    required Map<String, dynamic> responses,
    List<int>? audioBytes, Map<String, dynamic>? audioData,
  }) async {
    final fields = {
      'test_id': testId,
      'skill': skill,
      'responses': jsonEncode(responses),
    };

    List<http.MultipartFile>? files;
    if (audioBytes != null) {
      files = [
        http.MultipartFile.fromBytes(
          'audio',
          audioBytes,
          filename: 'section_response.m4a',
          contentType: MediaType('audio', 'aac'),
        ),
      ];
    }

    final response = await _api.postMultipart(
      '/api/assessment/submit-section',
      auth: true,
      fields: fields,
      files: files,
    );

    if (response.statusCode != 200) {
      throwForResponse(response, fallback: 'Failed to submit section');
    }

    return decodeJsonObject(response);
  }

  Future<Map<String, dynamic>> getResult(String testId) async {
    final response = await _api.get(
      '/api/assessment/result/$testId',
      auth: true,
    );

    if (response.statusCode != 200) {
      throwForResponse(response, fallback: 'Failed to get result');
    }

    return decodeJsonObject(response);
  }

  Future<Map<String, dynamic>> getProgress({String? examType}) async {
    final path = examType != null
        ? '/api/assessment/progress?examType=$examType'
        : '/api/assessment/progress';
    final response = await _api.get(path, auth: true);
    if (response.statusCode != 200) {
      throwForResponse(response, fallback: 'Failed to get progress');
    }
    return decodeJsonObject(response);
  }

  Future<void> reset({String? examType}) async {
    final response = await _api.post(
      '/api/assessment/reset',
      auth: true,
      body: examType != null ? {'examType': examType} : {},
    );

    if (response.statusCode != 200) {
      throwForResponse(response, fallback: 'Failed to reset assessment');
    }
  }

  // --- MOCK EXAM SPECIFIC ENDPOINTS ---
  // The backend uses a new, fully dynamic mock exam generator via Groq.
  // We map the new response format (dynamicContent) back into the mobile 
  // AssessmentBlueprint model so the mobile UI works without major changes.
  
  Future<AssessmentBlueprint> generateMockExam({
    required String examType,
    String difficulty = 'Medium',
    bool force = false,
  }) async {
    final response = await _api.post(
      '/api/mock-exam/generate',
      auth: true,
      body: {
        'examType': examType,
      },
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throwForResponse(response, fallback: 'Failed to generate mock exam');
    }

    final root = decodeJsonObject(response);
    final data = root['data'] ?? root;
    final dynamicContent = data['dynamicContent'];
    if (dynamicContent == null) {
      return AssessmentBlueprint.fromJson(root); // Fallback if API changed
    }

    // Map dynamicContent -> AssessmentBlueprint format
    final listeningSectionsList = dynamicContent['listening']?['sections'] as List? ?? [];
    final listeningQuestions = [];
    for (final s in listeningSectionsList) {
      listeningQuestions.addAll(s['questions'] ?? []);
    }

    final readingPassagesList = dynamicContent['reading']?['passages'] as List? ?? [];
    final readingQuestions = [];
    for (final p in readingPassagesList) {
      readingQuestions.addAll(p['questions'] ?? []);
    }

    final writing = dynamicContent['writing'] ?? {};
    final speaking = dynamicContent['speaking'] ?? {};

    final blueprintJson = {
      'test_id': data['examId'] ?? '',
      'exam_summary': {'type': examType, 'difficulty': difficulty},
      'sections': {
        'listening': {
          'audio_base64': null, // Mock exam uses TTS later
          'questions': listeningQuestions,
        },
        'reading': {
          'passage': readingPassagesList.isNotEmpty ? readingPassagesList.first['text'] ?? 'Please refer to the passage.' : 'No passage provided.',
          'questions': readingQuestions,
        },
        'writing': {
          'prompt': writing['task2']?['prompt'] ?? '',
          'task1_prompt': writing['task1']?['prompt'] ?? '',
          'task2_prompt': writing['task2']?['prompt'] ?? '',
        },
        'speaking': {
          'prompt': speaking['part2']?['cueCard'] ?? '',
          'part1_questions': speaking['part1'] ?? [],
          'part3_questions': speaking['part3'] ?? [],
          'cue_card_topic': speaking['part2']?['cueCard'] ?? '',
          'cue_card_points': speaking['part2']?['bulletPoints'] ?? [],
        }
      }
    };

    return AssessmentBlueprint.fromJson(blueprintJson);
  }

  Future<Map<String, dynamic>> submitMockExam({
    required String testId,
    required Map<String, dynamic> responses,
  }) async {
    final Map<String, dynamic> backendAnswers = {
      'listening': {},
      'reading': {},
      'writing': {},
      'speaking': {}
    };

    final stateAnswers = responses['answers'] as Map<String, dynamic>? ?? {};

    stateAnswers.forEach((key, value) {
      if (key.startsWith('L_')) {
        backendAnswers['listening'][key.substring(2)] = value;
      } else if (key.startsWith('R_')) {
        backendAnswers['reading'][key.substring(2)] = value;
      } else if (key == 'writing_task1') {
        backendAnswers['writing']['task1'] = value;
      } else if (key == 'writing_task2') {
        backendAnswers['writing']['task2'] = value;
      } else if (key == 'speaking_part1') {
        backendAnswers['speaking']['part1'] = value;
      }
    });

    final response = await _api.post(
      '/api/mock-exam/evaluate',
      auth: true,
      body: {
        'examId': testId,
        'answers': backendAnswers,
      },
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throwForResponse(response, fallback: 'Failed to submit mock exam');
    }

    return decodeJsonObject(response);
  }

  Future<Map<String, dynamic>> getMockExamResult(String testId) async {
    final response = await _api.get(
      '/api/mock-exam/result/$testId',
      auth: true,
    );

    if (response.statusCode != 200) {
      throwForResponse(response, fallback: 'Failed to get mock exam result');
    }

    final root = decodeJsonObject(response);
    final data = root['data'] ?? root;
    final evaluation = data['evaluation'] ?? {};
    
    // Map backend format to mobile result format
    final resultJson = {
      'status': 'success',
      'data': {
        'overall_score': evaluation['overallWritingBand'] ?? evaluation['listeningScore'] ?? 0.0,
        'scores': {
          'listening': evaluation['listeningScore'] ?? 0.0,
          'reading': evaluation['readingScore'] ?? 0.0,
          'writing': evaluation['overallWritingBand'] ?? 0.0,
          'speaking': 0.0,
        },
      }
    };
    
    return resultJson;
  }
}
