import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/learning_path/providers/mock_exam_provider.dart';
import 'package:mobile/features/learning_path/screens/mock_exam/mock_exam_dashboard.dart';
import 'package:mobile/features/learning_path/screens/mock_exam/mock_exam_active.dart';
import 'package:mobile/features/learning_path/screens/mock_exam/mock_exam_grading.dart';
import 'package:mobile/features/learning_path/screens/mock_exam/mock_exam_result.dart';
import 'package:mobile/features/learning_path/screens/mock_exam/mock_exam_break.dart';

class MockExamScreen extends ConsumerStatefulWidget {
  /// Pass the active exam type so the dashboard pre-selects IELTS or TOEFL.
  final String initialExamType;
  const MockExamScreen({super.key, this.initialExamType = 'IELTS'});

  @override
  ConsumerState<MockExamScreen> createState() => _MockExamScreenState();
}

class _MockExamScreenState extends ConsumerState<MockExamScreen> {
  @override
  void initState() {
    super.initState();
    // Pre-select the exam type that was active in the Mastery Hub
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(mockExamProvider.notifier).setExamType(widget.initialExamType);
    });
  }

  @override
  Widget build(BuildContext context) {
    final view = ref.watch(mockExamProvider.select((s) => s.view));

    return switch (view) {
      MockExamView.dashboard => const MockExamDashboard(),
      MockExamView.exam      => const MockExamActive(),
      MockExamView.grading   => const MockExamGrading(),
      MockExamView.result    => const MockExamResult(),
      MockExamView.breakTime => const MockExamBreak(),
    };
  }
}
