import 'package:flutter/material.dart';
import 'package:mobile/features/core/theme/design_system.dart';

class QuestionModel {
  final String id;
  final String type;
  final String questionText;
  final List<String>? options;
  final String? answer;

  QuestionModel({
    required this.id,
    required this.type,
    required this.questionText,
    this.options,
    this.answer,
  });
}

class QuestionEngine {
  static Widget buildQuestion({
    required QuestionModel question,
    required String? selectedAnswer,
    required Function(String) onAnswerSelected,
    required bool showFeedback,
    required BuildContext context,
  }) {
    switch (question.type) {
      case 'R_TFNG':
      case 'L_TFNG':
        return TFNGWidget(data: question, selectedAnswer: selectedAnswer, onAnswerSelected: onAnswerSelected, showFeedback: showFeedback);
      case 'R_MCQ':
      case 'L_MCQ':
      case 'W_IDEA':
      case 'W_STRUCTURE':
      case 'W_VOCAB':
      case 'S_PART1':
      case 'S_PART2':
      case 'S_PART3':
      case 'S_MIXED':
        return MCQWidget(data: question, selectedAnswer: selectedAnswer, onAnswerSelected: onAnswerSelected, showFeedback: showFeedback);
      case 'R_FILL':
      case 'L_FILL':
      case 'W_FIX':
      case 'W_MERGE':
        return FillInBlanksWidget(data: question, selectedAnswer: selectedAnswer, onAnswerSelected: onAnswerSelected, showFeedback: showFeedback);
      case 'R_HEAD':
        return HeadingsWidget(data: question, selectedAnswer: selectedAnswer, onAnswerSelected: onAnswerSelected, showFeedback: showFeedback);
      case 'R_MATCH':
      case 'L_MATCH':
        return MatchWidget(data: question, selectedAnswer: selectedAnswer, onAnswerSelected: onAnswerSelected, showFeedback: showFeedback);
      case 'R_DIAG':
      case 'L_DIAG':
        return DiagramWidget(data: question, selectedAnswer: selectedAnswer, onAnswerSelected: onAnswerSelected, showFeedback: showFeedback);
      default:
        return Padding(
          padding: const EdgeInsets.all(16.0),
          child: Text("Unsupported Question Type: ${question.type}", style: const TextStyle(color: Colors.red)),
        );
    }
  }
}

// --- Specific Question Widgets (Stubs) ---

class TFNGWidget extends StatelessWidget {
  final QuestionModel data;
  final String? selectedAnswer;
  final Function(String) onAnswerSelected;
  final bool showFeedback;

  const TFNGWidget({super.key, required this.data, required this.selectedAnswer, required this.onAnswerSelected, required this.showFeedback});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(data.questionText, style: DesignSystem.bodyStyle(buildContext: context, fontWeight: FontWeight.bold).copyWith(fontSize: 16)),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(child: _buildOptionBtn(context, "TRUE")),
            const SizedBox(width: 8),
            Expanded(child: _buildOptionBtn(context, "FALSE")),
            const SizedBox(width: 8),
            Expanded(child: _buildOptionBtn(context, "NOT GIVEN")),
          ],
        )
      ],
    );
  }

  Widget _buildOptionBtn(BuildContext context, String label) {
    final isSelected = selectedAnswer == label;
    final isCorrect = data.answer?.toUpperCase() == label;
    
    Color bgColor = DesignSystem.surface(context);
    Color borderColor = DesignSystem.glassBorder(context);
    Color fgColor = DesignSystem.mainText(context);
    
    if (showFeedback) {
      if (isCorrect) {
        bgColor = DesignSystem.emerald.withValues(alpha: 0.15);
        borderColor = DesignSystem.emerald;
        fgColor = DesignSystem.emerald;
      } else if (isSelected) {
        bgColor = const Color(0xFFF43F5E).withValues(alpha: 0.15);
        borderColor = const Color(0xFFF43F5E);
        fgColor = const Color(0xFFF43F5E);
      }
    } else if (isSelected) {
      bgColor = DesignSystem.emerald.withValues(alpha: 0.1);
      borderColor = DesignSystem.emerald;
      fgColor = DesignSystem.emerald;
    }

    return GestureDetector(
      onTap: showFeedback ? null : () => onAnswerSelected(label),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeInOut,
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: borderColor, width: isSelected || (showFeedback && isCorrect) ? 2 : 1),
          boxShadow: isSelected && !showFeedback ? [
            BoxShadow(
              color: DesignSystem.emerald.withValues(alpha: 0.2),
              blurRadius: 8,
              offset: const Offset(0, 4),
            )
          ] : null,
        ),
        child: Center(
          child: Text(
            label,
            style: DesignSystem.bodyStyle(buildContext: context).copyWith(
              color: fgColor,
              fontWeight: isSelected || (showFeedback && isCorrect) ? FontWeight.bold : FontWeight.normal,
              fontSize: 12,
            ),
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}

class MCQWidget extends StatelessWidget {
  final QuestionModel data;
  final String? selectedAnswer;
  final Function(String) onAnswerSelected;
  final bool showFeedback;

  const MCQWidget({super.key, required this.data, required this.selectedAnswer, required this.onAnswerSelected, required this.showFeedback});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(data.questionText, style: DesignSystem.bodyStyle(buildContext: context, fontWeight: FontWeight.bold).copyWith(fontSize: 16)),
        const SizedBox(height: 16),
        if (data.options != null)
          ...data.options!.map((opt) {
            final isSelected = selectedAnswer == opt;
            final isCorrect = data.answer == opt;
            
            Color bgColor = DesignSystem.surface(context);
            Color borderColor = DesignSystem.glassBorder(context);
            Color iconColor = DesignSystem.subText(context);

            if (showFeedback) {
              if (isCorrect) {
                bgColor = DesignSystem.emerald.withValues(alpha: 0.15);
                borderColor = DesignSystem.emerald;
                iconColor = DesignSystem.emerald;
              } else if (isSelected) {
                bgColor = const Color(0xFFF43F5E).withValues(alpha: 0.15);
                borderColor = const Color(0xFFF43F5E);
                iconColor = const Color(0xFFF43F5E);
              }
            } else if (isSelected) {
              bgColor = DesignSystem.emerald.withValues(alpha: 0.1);
              borderColor = DesignSystem.emerald;
              iconColor = DesignSystem.emerald;
            }

            return GestureDetector(
              onTap: showFeedback ? null : () => onAnswerSelected(opt),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                decoration: BoxDecoration(
                  color: bgColor,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: borderColor, width: isSelected || (showFeedback && isCorrect) ? 2 : 1),
                  boxShadow: isSelected && !showFeedback ? [
                    BoxShadow(color: DesignSystem.emerald.withValues(alpha: 0.1), blurRadius: 10, offset: const Offset(0, 4))
                  ] : null,
                ),
                child: Row(
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: iconColor, width: 2),
                        color: isSelected ? iconColor : Colors.transparent,
                      ),
                      child: isSelected
                          ? const Icon(Icons.check, size: 16, color: Colors.white)
                          : null,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Text(
                        opt,
                        style: DesignSystem.bodyStyle(buildContext: context).copyWith(
                          color: (showFeedback && isCorrect) ? DesignSystem.emerald : DesignSystem.mainText(context),
                          fontWeight: isSelected || (showFeedback && isCorrect) ? FontWeight.w600 : FontWeight.normal,
                        ),
                      ),
                    ),
                    if (showFeedback && isCorrect)
                      const Icon(Icons.check_circle_rounded, color: DesignSystem.emerald),
                    if (showFeedback && isSelected && !isCorrect)
                      const Icon(Icons.cancel_rounded, color: Color(0xFFF43F5E)),
                  ],
                ),
              ),
            );
          }),
      ],
    );
  }
}

class FillInBlanksWidget extends StatelessWidget {
  final QuestionModel data;
  final String? selectedAnswer;
  final Function(String) onAnswerSelected;
  final bool showFeedback;

  const FillInBlanksWidget({super.key, required this.data, required this.selectedAnswer, required this.onAnswerSelected, required this.showFeedback});

  @override
  Widget build(BuildContext context) {
    bool isCorrect = false;
    if (showFeedback && selectedAnswer != null && data.answer != null) {
      isCorrect = selectedAnswer!.trim().toLowerCase() == data.answer!.trim().toLowerCase();
    }

    Color borderColor = DesignSystem.glassBorder(context);
    if (showFeedback) {
      borderColor = isCorrect ? DesignSystem.emerald : const Color(0xFFF43F5E);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(data.questionText, style: DesignSystem.bodyStyle(buildContext: context, fontWeight: FontWeight.bold).copyWith(fontSize: 16)),
        const SizedBox(height: 16),
        AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          decoration: BoxDecoration(
            color: showFeedback 
              ? (isCorrect ? DesignSystem.emerald.withValues(alpha: 0.05) : const Color(0xFFF43F5E).withValues(alpha: 0.05))
              : DesignSystem.surface(context),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: borderColor.withValues(alpha: 0.2),
                blurRadius: 10,
                offset: const Offset(0, 2),
              )
            ]
          ),
          child: TextFormField(
            initialValue: selectedAnswer,
            onChanged: onAnswerSelected,
            readOnly: showFeedback,
            style: DesignSystem.bodyStyle(buildContext: context).copyWith(
              color: showFeedback ? (isCorrect ? DesignSystem.emerald : const Color(0xFFF43F5E)) : DesignSystem.mainText(context),
              fontWeight: FontWeight.w500,
            ),
            decoration: InputDecoration(
              hintText: "Type your answer here...",
              hintStyle: TextStyle(color: DesignSystem.subText(context)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: borderColor, width: 1),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: borderColor, width: 1),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: showFeedback ? borderColor : DesignSystem.emerald, width: 2),
              ),
              suffixIcon: showFeedback 
                ? Icon(
                    isCorrect ? Icons.check_circle_rounded : Icons.cancel_rounded,
                    color: isCorrect ? DesignSystem.emerald : const Color(0xFFF43F5E),
                  )
                : null,
            ),
          ),
        )
      ],
    );
  }
}

class HeadingsWidget extends StatelessWidget {
  final QuestionModel data;
  final String? selectedAnswer;
  final Function(String) onAnswerSelected;
  final bool showFeedback;

  const HeadingsWidget({super.key, required this.data, required this.selectedAnswer, required this.onAnswerSelected, required this.showFeedback});

  @override
  Widget build(BuildContext context) {
    return MCQWidget(data: data, selectedAnswer: selectedAnswer, onAnswerSelected: onAnswerSelected, showFeedback: showFeedback);
  }
}

class MatchWidget extends StatelessWidget {
  final QuestionModel data;
  final String? selectedAnswer;
  final Function(String) onAnswerSelected;
  final bool showFeedback;

  const MatchWidget({super.key, required this.data, required this.selectedAnswer, required this.onAnswerSelected, required this.showFeedback});

  @override
  Widget build(BuildContext context) {
    return MCQWidget(data: data, selectedAnswer: selectedAnswer, onAnswerSelected: onAnswerSelected, showFeedback: showFeedback);
  }
}

class DiagramWidget extends StatelessWidget {
  final QuestionModel data;
  final String? selectedAnswer;
  final Function(String) onAnswerSelected;
  final bool showFeedback;

  const DiagramWidget({super.key, required this.data, required this.selectedAnswer, required this.onAnswerSelected, required this.showFeedback});

  @override
  Widget build(BuildContext context) {
    bool isCorrect = false;
    if (showFeedback && selectedAnswer != null && data.answer != null) {
      isCorrect = selectedAnswer!.trim().toLowerCase() == data.answer!.trim().toLowerCase();
    }

    Color borderColor = DesignSystem.glassBorder(context);
    if (showFeedback) {
      borderColor = isCorrect ? DesignSystem.emerald : const Color(0xFFF43F5E);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(data.questionText, style: DesignSystem.bodyStyle(buildContext: context, fontWeight: FontWeight.bold).copyWith(fontSize: 16)),
        const SizedBox(height: 16),
        Container(
          height: 220,
          decoration: BoxDecoration(
            color: DesignSystem.surface(context).withValues(alpha: 0.5),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: DesignSystem.glassBorder(context)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 10,
                offset: const Offset(0, 4),
              )
            ]
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.image_outlined, size: 48, color: DesignSystem.subText(context)),
                const SizedBox(height: 12),
                Text("Diagram / Illustration", style: TextStyle(color: DesignSystem.subText(context), fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),
        AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          decoration: BoxDecoration(
            color: showFeedback 
              ? (isCorrect ? DesignSystem.emerald.withValues(alpha: 0.05) : const Color(0xFFF43F5E).withValues(alpha: 0.05))
              : DesignSystem.surface(context),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: borderColor.withValues(alpha: 0.2),
                blurRadius: 10,
                offset: const Offset(0, 2),
              )
            ]
          ),
          child: TextFormField(
            initialValue: selectedAnswer,
            onChanged: onAnswerSelected,
            readOnly: showFeedback,
            style: DesignSystem.bodyStyle(buildContext: context).copyWith(
              color: showFeedback ? (isCorrect ? DesignSystem.emerald : const Color(0xFFF43F5E)) : DesignSystem.mainText(context),
              fontWeight: FontWeight.w500,
            ),
            decoration: InputDecoration(
              hintText: "Enter the label for this section...",
              hintStyle: TextStyle(color: DesignSystem.subText(context)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: borderColor, width: 1),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: borderColor, width: 1),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: showFeedback ? borderColor : DesignSystem.emerald, width: 2),
              ),
              suffixIcon: showFeedback 
                ? Icon(
                    isCorrect ? Icons.check_circle_rounded : Icons.cancel_rounded,
                    color: isCorrect ? DesignSystem.emerald : const Color(0xFFF43F5E),
                  )
                : null,
            ),
          ),
        )
      ],
    );
  }
}
