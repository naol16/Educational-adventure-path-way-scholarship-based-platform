import 'package:flutter/material.dart';
import '../utils/app_colors.dart';

class MatchingAnalysisOverlay extends StatefulWidget {
  final VoidCallback onComplete;

  const MatchingAnalysisOverlay({super.key, required this.onComplete});

  @override
  State<MatchingAnalysisOverlay> createState() => _MatchingAnalysisOverlayState();
}

class _MatchingAnalysisOverlayState extends State<MatchingAnalysisOverlay>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _rotationController;
  late Animation<double> _pulseAnimation;

  int _currentStep = 0;
  final List<String> _steps = [
    "Scanning 10,000+ scholarships...",
    "Calculating eligibility matches...",
    "Optimizing ranking rules...",
  ];

  @override
  void initState() {
    super.initState();

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();

    _startStepAnimation();
  }

  void _startStepAnimation() async {
    for (int i = 0; i < _steps.length; i++) {
      await Future.delayed(const Duration(milliseconds: 1500));
      if (mounted) {
        setState(() {
          _currentStep = i + 1;
        });
      }
    }
    await Future.delayed(const Duration(milliseconds: 1000));
    widget.onComplete();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _rotationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 40),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Central Animation Area
              Stack(
                alignment: Alignment.center,
                children: [
                   // Rotating dotted ring
                  RotationTransition(
                    turns: _rotationController,
                    child: Container(
                      width: 180,
                      height: 180,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: AppColors.primary.withValues(alpha: 0.2),
                          width: 2,
                          style: BorderStyle.solid, // Note: Flutter doesn't native support dashed borders easily in BoxDecoration
                        ),
                      ),
                      child: CustomPaint(
                        painter: _DottedCirclePainter(color: AppColors.primary.withValues(alpha: 0.3)),
                      ),
                    ),
                  ),
                  
                  // Pulsating glow
                  ScaleTransition(
                    scale: _pulseAnimation,
                    child: Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.primary.withValues(alpha: 0.05),
                      ),
                    ),
                  ),

                  // The Brain / AI Icon
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 20,
                          spreadRadius: 5,
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.psychology_outlined, // Brain-like icon
                      size: 64,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 48),

              // Title
              const Text(
                "Analyzing your profile...",
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textDark,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),

              // Steps List
              Column(
                children: List.generate(_steps.length, (index) {
                  final isCompleted = index < _currentStep;
                  final isCurrent = index == _currentStep;

                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: AnimatedOpacity(
                      duration: const Duration(milliseconds: 500),
                      opacity: (isCompleted || isCurrent) ? 1.0 : 0.4,
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: isCompleted
                                  ? AppColors.primary.withValues(alpha: 0.1)
                                  : Colors.transparent,
                            ),
                            child: Icon(
                              isCompleted ? Icons.check_circle : Icons.circle_outlined,
                              size: 18,
                              color: isCompleted ? AppColors.primary : AppColors.textLight,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              _steps[index],
                              style: TextStyle(
                                fontSize: 14,
                                color: isCompleted ? AppColors.textDark : AppColors.textLight,
                                fontWeight: isCompleted ? FontWeight.w500 : FontWeight.normal,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DottedCirclePainter extends CustomPainter {
  final Color color;
  _DottedCirclePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint = Paint()
      ..color = color
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    const double dashWidth = 5;
    const double dashSpace = 5;
    double startAngle = 0;

    final double circumference = 2 * 3.1415926535 * (size.width / 2);
    final int dashCount = (circumference / (dashWidth + dashSpace)).floor();

    for (int i = 0; i < dashCount; i++) {
        canvas.drawArc(
          Rect.fromLTWH(0, 0, size.width, size.height),
          startAngle,
          (dashWidth / circumference) * 2 * 3.1415926535,
          false,
          paint,
        );
        startAngle += ((dashWidth + dashSpace) / circumference) * 2 * 3.1415926535;
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
