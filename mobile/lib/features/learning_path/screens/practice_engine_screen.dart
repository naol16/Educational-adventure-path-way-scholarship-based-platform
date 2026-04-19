import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';

class PracticeEngineScreen extends StatefulWidget {
  const PracticeEngineScreen({super.key});

  @override
  State<PracticeEngineScreen> createState() => _PracticeEngineScreenState();
}

class _PracticeEngineScreenState extends State<PracticeEngineScreen> {
  int? _selectedOption;
  bool _showFeedback = false;
  final int _correctOption = 1; // 0-indexed

  void _submitAnswer() {
    if (_selectedOption != null) {
      setState(() {
        _showFeedback = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(LucideIcons.arrowLeft, color: DesignSystem.mainText(context)),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          "PRACTICE DRILL",
          style: DesignSystem.labelStyle(buildContext: context, fontSize: 12).copyWith(
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
            color: DesignSystem.primary(context),
          ),
        ),
        centerTitle: true,
      ),
      body: Stack(
        children: [
          // Background Glow
          Positioned(
            top: -50,
            right: -50,
            child: _buildBlurCircle(DesignSystem.emerald.withOpacity(0.05), 300),
          ),
          
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Question 1 of 5",
                    style: DesignSystem.labelStyle(buildContext: context, fontSize: 12),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    "Which of the following skimming techniques is most effective when searching for specific dates?",
                    style: DesignSystem.headingStyle(buildContext: context, fontSize: 20),
                  ),
                  const SizedBox(height: 32),
                  
                  _buildOption(context, 0, "A. Reading the first and last sentence of every paragraph."),
                  const SizedBox(height: 12),
                  _buildOption(context, 1, "B. Scanning vertically for numbers and capitalized words."),
                  const SizedBox(height: 12),
                  _buildOption(context, 2, "C. Reading the text backwards word by word."),
                  
                  const Spacer(),
                  
                  PrimaryButton(
                    text: _showFeedback ? "CONTINUE" : "SUBMIT ANSWER",
                    onPressed: _showFeedback ? () => Navigator.pop(context) : _submitAnswer,
                  ),
                ],
              ),
            ),
          ),
          
          if (_showFeedback)
            Positioned.fill(
              child: _buildFeedbackOverlay(context),
            ),
        ],
      ),
    );
  }

  Widget _buildOption(BuildContext context, int index, String text) {
    final isSelected = _selectedOption == index;
    final primaryColor = DesignSystem.primary(context);
    
    Color borderColor = Colors.transparent;
    Color bgColor = DesignSystem.surface(context);
    
    if (isSelected) {
      borderColor = primaryColor;
      bgColor = primaryColor.withOpacity(0.1);
    }
    
    if (_showFeedback) {
      if (index == _correctOption) {
        borderColor = DesignSystem.emerald;
        bgColor = DesignSystem.emerald.withOpacity(0.1);
      } else if (isSelected && index != _correctOption) {
        borderColor = const Color(0xFFF43F5E); // Red
        bgColor = const Color(0xFFF43F5E).withOpacity(0.1);
      }
    }

    return GestureDetector(
      onTap: _showFeedback ? null : () {
        setState(() {
          _selectedOption = index;
        });
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: borderColor,
            width: 2,
          ),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                text,
                style: GoogleFonts.inter(
                  color: DesignSystem.mainText(context),
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeedbackOverlay(BuildContext context) {
    final isCorrect = _selectedOption == _correctOption;
    final color = isCorrect ? DesignSystem.emerald : const Color(0xFFF43F5E);
    final icon = isCorrect ? LucideIcons.checkCircle : LucideIcons.xCircle;
    final title = isCorrect ? "Correct!" : "Incorrect";
    final message = isCorrect 
        ? "Excellent job! Scanning vertically is the most efficient way to find specific factual data like dates."
        : "Actually, scanning vertically is more effective for finding specific data points like numbers.";

    return Container(
      color: Colors.black.withOpacity(0.5),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: DesignSystem.themeBackground(context).withOpacity(0.8),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: color.withOpacity(0.5)),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(icon, size: 48, color: color),
                    const SizedBox(height: 16),
                    Text(
                      title,
                      style: DesignSystem.headingStyle(buildContext: context, fontSize: 24).copyWith(color: color),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      message,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(
                        color: DesignSystem.mainText(context).withOpacity(0.8),
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBlurCircle(Color color, double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
        boxShadow: [BoxShadow(color: color, blurRadius: 100, spreadRadius: 50)],
      ),
    );
  }
}
