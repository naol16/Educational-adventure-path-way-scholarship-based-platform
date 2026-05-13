class AssessmentBlueprint {
  final String testId;
  final String examType;
  final String difficulty;
  final AssessmentSections sections;

  AssessmentBlueprint({
    required this.testId,
    required this.examType,
    required this.difficulty,
    required this.sections,
  });

  factory AssessmentBlueprint.fromJson(Map<String, dynamic> json) {
    final data = json['data'] ?? json;
    return AssessmentBlueprint(
      testId: data['test_id'] ?? '',
      examType: data['exam_summary']?['type'] ?? '',
      difficulty: data['exam_summary']?['difficulty'] ?? '',
      sections: AssessmentSections.fromJson(data['sections'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() => {
    'test_id': testId,
    'exam_summary': {'type': examType, 'difficulty': difficulty},
    'sections': sections.toJson(),
  };
}

class AssessmentSections {
  final ReadingSection? reading;
  final ListeningSection? listening;
  final WritingSection? writing;
  final SpeakingSection? speaking;

  AssessmentSections({
    this.reading,
    this.listening,
    this.writing,
    this.speaking,
  });

  factory AssessmentSections.fromJson(Map<String, dynamic> json) {
    return AssessmentSections(
      reading: json['reading'] != null ? ReadingSection.fromJson(json['reading']) : null,
      listening: json['listening'] != null ? ListeningSection.fromJson(json['listening']) : null,
      writing: json['writing'] != null ? WritingSection.fromJson(json['writing']) : null,
      speaking: json['speaking'] != null ? SpeakingSection.fromJson(json['speaking']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
    if (reading != null) 'reading': reading!.toJson(),
    if (listening != null) 'listening': listening!.toJson(),
    if (writing != null) 'writing': writing!.toJson(),
    if (speaking != null) 'speaking': speaking!.toJson(),
  };

  int get totalQuestionCount {
    return (listening?.questions.length ?? 0) + (reading?.questions.length ?? 0);
  }
}

class ReadingSection {
  final String passage;
  final List<AssessmentQuestion> questions;
  final List<String> paragraphs;
  final List<String> headings;

  ReadingSection({
    required this.passage,
    required this.questions,
    this.paragraphs = const [],
    this.headings = const [],
  });

  factory ReadingSection.fromJson(Map<String, dynamic> json) {
    final passageText = json['passage'] ?? '';
    final rawParagraphs = (json['paragraphs'] as List?)?.cast<String>() ?? [];
    final autoParagraphs = rawParagraphs.isEmpty && passageText.isNotEmpty
        ? passageText.split(RegExp(r'\n\n+'))
            .where((p) => p.trim().isNotEmpty)
            .toList()
        : rawParagraphs;

    return ReadingSection(
      passage: passageText,
      questions: (json['questions'] as List?)
              ?.map((q) => AssessmentQuestion.fromJson(q))
              .toList() ??
          [],
      paragraphs: autoParagraphs,
      headings: (json['headings'] as List?)?.cast<String>() ?? [],
    );
  }

  Map<String, dynamic> toJson() => {
    'passage': passage,
    'questions': questions.map((q) => q.toJson()).toList(),
    'paragraphs': paragraphs,
    'headings': headings,
  };
}

class ListeningSection {
  final String? audioBase64;
  final List<AssessmentQuestion> questions;
  /// Optional background image for the lecture (TOEFL)
  final String? lectureImageUrl;

  ListeningSection({this.audioBase64, required this.questions, this.lectureImageUrl});

  factory ListeningSection.fromJson(Map<String, dynamic> json) {
    return ListeningSection(
      audioBase64: json['audio_base64'],
      lectureImageUrl: json['lecture_image_url'],
      questions: (json['questions'] as List?)
              ?.map((q) => AssessmentQuestion.fromJson(q))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() => {
    'audio_base64': audioBase64,
    'lecture_image_url': lectureImageUrl,
    'questions': questions.map((q) => q.toJson()).toList(),
  };
}

class WritingSection {
  final String prompt;
  final String task1Prompt;
  final String task2Prompt;
  final String? task1ImageUrl;
  /// TOEFL Task 2: Academic Discussion data
  final String? professorPost;
  final List<Map<String, String>>? studentPosts; // [{'name': '...', 'post': '...'}]

  WritingSection({
    required this.prompt,
    this.task1Prompt = '',
    this.task2Prompt = '',
    this.task1ImageUrl,
    this.professorPost,
    this.studentPosts,
  });

  factory WritingSection.fromJson(Map<String, dynamic> json) {
    final mainPrompt = json['prompt'] ?? '';
    final discussion = json['academic_discussion'] as Map<String, dynamic>?;
    
    return WritingSection(
      prompt: mainPrompt,
      task1Prompt: json['task1_prompt'] ?? json['task1Prompt'] ?? mainPrompt,
      task2Prompt: json['task2_prompt'] ?? json['task2Prompt'] ?? '',
      task1ImageUrl: json['task1_image_url'] ?? json['task1ImageUrl'],
      professorPost: discussion?['professor_post'],
      studentPosts: (discussion?['student_posts'] as List?)
          ?.map((e) => Map<String, String>.from(e))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
    'prompt': prompt,
    'task1_prompt': task1Prompt,
    'task2_prompt': task2Prompt,
    'task1_image_url': task1ImageUrl,
    'academic_discussion': {
      if (professorPost != null) 'professor_post': professorPost,
      if (studentPosts != null) 'student_posts': studentPosts,
    },
  };
}

class SpeakingSection {
  final String prompt;
  final List<String> part1Questions;
  final String cueCardTopic;
  final List<String> cueCardPoints;
  final List<String> part3Questions;
  /// TOEFL Integrated Task Data
  final String? integratedReadingText;
  final String? integratedAudioUrl; // Or audioBase64 if provided

  SpeakingSection({
    required this.prompt,
    this.part1Questions = const [],
    this.cueCardTopic = '',
    this.cueCardPoints = const [],
    this.part3Questions = const [],
    this.integratedReadingText,
    this.integratedAudioUrl,
  });

  factory SpeakingSection.fromJson(Map<String, dynamic> json) {
    return SpeakingSection(
      prompt: json['prompt'] ?? '',
      part1Questions: (json['part1_questions'] as List?)?.cast<String>() ?? [],
      cueCardTopic: json['cue_card_topic'] ?? json['cueCardTopic'] ?? '',
      cueCardPoints: (json['cue_card_points'] as List?)?.cast<String>() ??
          (json['cueCardPoints'] as List?)?.cast<String>() ?? [],
      part3Questions: (json['part3_questions'] as List?)?.cast<String>() ?? [],
      integratedReadingText: json['integrated_reading_text'],
      integratedAudioUrl: json['integrated_audio_url'],
    );
  }

  Map<String, dynamic> toJson() => {
    'prompt': prompt,
    'part1_questions': part1Questions,
    'cue_card_topic': cueCardTopic,
    'cue_card_points': cueCardPoints,
    'part3_questions': part3Questions,
    'integrated_reading_text': integratedReadingText,
    'integrated_audio_url': integratedAudioUrl,
  };
}

enum QuestionType {
  mcq,
  form,
  map,
  tfng,
  heading,
  insert,  // TOEFL Sentence Insertion
  summary, // TOEFL Summary (3 of 6)
}

class AssessmentQuestion {
  final dynamic id;
  final String question;
  final List<String> options;
  final QuestionType type;
  final String? imageUrl;
  final String? correctAnswer;
  /// TOEFL T_INSERT: The sentence to insert
  final String? insertSentence;

  AssessmentQuestion({
    required this.id,
    required this.question,
    required this.options,
    this.type = QuestionType.mcq,
    this.imageUrl,
    this.correctAnswer,
    this.insertSentence,
  });

  factory AssessmentQuestion.fromJson(Map<String, dynamic> json) {
    return AssessmentQuestion(
      id: json['id'],
      question: json['question'] ?? '',
      options: (json['options'] as List?)?.map((o) => o.toString()).toList() ?? [],
      type: _parseType(json['type']),
      imageUrl: json['image_url'] ?? json['imageUrl'],
      correctAnswer: json['correct_answer'] ?? json['correctAnswer'],
      insertSentence: json['insert_sentence'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'question': question,
    'options': options,
    'type': type.name,
    'image_url': imageUrl,
    'correct_answer': correctAnswer,
    'insert_sentence': insertSentence,
  };

  static QuestionType _parseType(dynamic raw) {
    if (raw == null) return QuestionType.mcq;
    final s = raw.toString().toLowerCase();
    return switch (s) {
      'form' || 'l_form' => QuestionType.form,
      'map' || 'l_map' => QuestionType.map,
      'tfng' || 'r_tfng' || 'true_false_not_given' => QuestionType.tfng,
      'heading' || 'r_heading' => QuestionType.heading,
      'insert' || 't_insert' => QuestionType.insert,
      'summary' || 't_summary' => QuestionType.summary,
      _ => QuestionType.mcq,
    };
  }
}
