import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';

class MatchingAnalysisOverlay extends StatefulWidget {
  final VoidCallback onComplete;

  const MatchingAnalysisOverlay({super.key, required this.onComplete});

  @override
  State<MatchingAnalysisOverlay> createState() =>
      _MatchingAnalysisOverlayState();
}

class _MatchingAnalysisOverlayState extends State<MatchingAnalysisOverlay>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _rotationController;
  late AnimationController _scanController;
  late Animation<double> _pulseAnimation;
  late Animation<double> _scanAnimation;

  int _currentStep = 0;
  final List<String> _steps = [
    "Scanning global scholarship database...",
    "Analyzing academic transcripts...",
    "Matching profile with 5,000+ eligibility rules...",
    "Calculating fit scores using AI...",
    "Finalizing your matches...",
  ];

  @override
  void initState() {
    super.initState();

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat();

    _scanController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat();

    _scanAnimation = Tween<double>(begin: -0.5, end: 1.5).animate(
      CurvedAnimation(parent: _scanController, curve: Curves.easeInOut),
    );

    _startStepAnimation();
  }

  void _startStepAnimation() async {
    for (int i = 0; i < _steps.length; i++) {
      await Future.delayed(const Duration(milliseconds: 1800));
      if (mounted) {
        setState(() {
          _currentStep = i + 1;
        });
      }
    }
    await Future.delayed(const Duration(milliseconds: 1200));
    widget.onComplete();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _rotationController.dispose();
    _scanController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final primary = DesignSystem.primary(context);
    
    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: Stack(
        children: [
          // Background Glows & Particles
          _buildBackgroundEffect(primary),

          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Central Animation Area
                  _buildCentralBrain(primary),
                  
                  const SizedBox(height: 60),

                  // Title Area
                  TweenAnimationBuilder<double>(
                    tween: Tween(begin: 0, end: 1),
                    duration: const Duration(milliseconds: 800),
                    builder: (context, value, child) {
                      return Opacity(
                        opacity: value,
                        child: Transform.translate(
                          offset: Offset(0, 20 * (1 - value)),
                          child: child,
                        ),
                      );
                    },
                    child: Column(
                      children: [
                        Text(
                          "AI Analysis Engine",
                          style: DesignSystem.headingStyle(
                            buildContext: context,
                            fontSize: 28,
                          ).copyWith(letterSpacing: -0.5),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          "Processing your data to find the perfect scholarship match",
                          style: DesignSystem.bodyStyle(
                            buildContext: context,
                            fontSize: 14,
                            color: DesignSystem.labelText(context),
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 48),

                  // Steps List
                  _buildStepsContainer(context),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBackgroundEffect(Color primary) {
    return Stack(
      children: [
        Center(
          child: DesignSystem.buildBlurCircle(
            primary.withValues(alpha: 0.08),
            500,
          ),
        ),
        // Floating Particles
        ...List.generate(15, (index) {
          final random = math.Random(index);
          final size = random.nextDouble() * 4 + 2;
          return Positioned(
            left: random.nextDouble() * MediaQuery.of(context).size.width,
            top: random.nextDouble() * MediaQuery.of(context).size.height,
            child: _FloatingParticle(color: primary.withValues(alpha: 0.3), size: size),
          );
        }),
      ],
    );
  }

  Widget _buildCentralBrain(Color primary) {
    return Stack(
      alignment: Alignment.center,
      children: [
        // Orbiting rings
        RotationTransition(
          turns: _rotationController,
          child: _buildOrbitalRing(primary, 220, 0.1),
        ),
        RotationTransition(
          turns: _rotationController,
          child: Transform.rotate(
            angle: math.pi / 2,
            child: _buildOrbitalRing(primary, 180, 0.2),
          ),
        ),

        // Pulsating glow
        ScaleTransition(
          scale: _pulseAnimation,
          child: Container(
            width: 140,
            height: 140,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: primary.withValues(alpha: 0.15),
                  blurRadius: 40,
                  spreadRadius: 10,
                ),
              ],
            ),
          ),
        ),

        // Brain Container with Scan Line
        Container(
          width: 140,
          height: 140,
          decoration: BoxDecoration(
            color: DesignSystem.themeBackground(context).withValues(alpha: 0.8),
            shape: BoxShape.circle,
            border: Border.all(color: primary.withValues(alpha: 0.3), width: 2),
            boxShadow: [
              BoxShadow(
                color: primary.withValues(alpha: 0.1),
                blurRadius: 30,
              ),
            ],
          ),
          clipBehavior: Clip.antiAlias,
          child: Stack(
            alignment: Alignment.center,
            children: [
              Icon(
                LucideIcons.brainCircuit,
                size: 72,
                color: primary,
              ),
              // Scanning Beam
              AnimatedBuilder(
                animation: _scanAnimation,
                builder: (context, child) {
                  return Positioned(
                    top: _scanAnimation.value * 140,
                    left: 0,
                    right: 0,
                    child: Container(
                      height: 40,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            primary.withValues(alpha: 0.3),
                            primary,
                            primary.withValues(alpha: 0.3),
                            Colors.transparent,
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildOrbitalRing(Color color, double size, double opacity) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: color.withValues(alpha: opacity), width: 1.5),
      ),
      child: CustomPaint(
        painter: _DottedCirclePainter(color: color.withValues(alpha: opacity * 2)),
      ),
    );
  }

  Widget _buildStepsContainer(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: DesignSystem.surface(context).withValues(alpha: 0.4),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: DesignSystem.glassBorder(context)),
      ),
      child: Column(
        children: List.generate(_steps.length, (index) {
          final isCompleted = index < _currentStep;
          final isCurrent = index == _currentStep;

          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: AnimatedOpacity(
              duration: const Duration(milliseconds: 600),
              opacity: (isCompleted || isCurrent) ? 1.0 : 0.2,
              child: Row(
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isCompleted ? DesignSystem.primary(context) : Colors.transparent,
                      border: Border.all(
                        color: isCompleted ? DesignSystem.primary(context) : DesignSystem.labelText(context),
                        width: 2,
                      ),
                    ),
                    child: Center(
                      child: isCompleted
                          ? const Icon(Icons.check, size: 14, color: Colors.black)
                          : isCurrent 
                            ? SizedBox(width: 10, height: 10, child: CircularProgressIndicator(strokeWidth: 2, color: DesignSystem.primary(context)))
                            : null,
                    ),
                  ),
                  const SizedBox(width: 18),
                  Expanded(
                    child: Text(
                      _steps[index],
                      style: DesignSystem.bodyStyle(
                        buildContext: context,
                        fontSize: 14,
                        color: isCurrent ? DesignSystem.mainText(context) : DesignSystem.labelText(context),
                      ).copyWith(fontWeight: isCurrent ? FontWeight.w700 : FontWeight.w400),
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }
}

class _FloatingParticle extends StatefulWidget {
  final Color color;
  final double size;
  const _FloatingParticle({required this.color, required this.size});

  @override
  State<_FloatingParticle> createState() => _FloatingParticleState();
}

class _FloatingParticleState extends State<_FloatingParticle> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Offset _offset;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: Duration(seconds: 4 + math.Random().nextInt(4)))..repeat();
    _offset = Offset(math.Random().nextDouble() * 20 - 10, math.Random().nextDouble() * 20 - 10);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final sinVal = math.sin(_controller.value * math.pi * 2);
        return Transform.translate(
          offset: _offset * sinVal,
          child: Container(
            width: widget.size,
            height: widget.size,
            decoration: BoxDecoration(color: widget.color, shape: BoxShape.circle),
          ),
        );
      },
    );
  }
}

class _DottedCirclePainter extends CustomPainter {
  final Color color;
  _DottedCirclePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint = Paint()..color = color..strokeWidth = 2..style = PaintingStyle.stroke;
    const double dashWidth = 3;
    const double dashSpace = 8;
    double startAngle = 0;
    final double circumference = math.pi * size.width;
    final int dashCount = (circumference / (dashWidth + dashSpace)).floor();
    for (int i = 0; i < dashCount; i++) {
      canvas.drawArc(Rect.fromLTWH(0, 0, size.width, size.height), startAngle, (dashWidth / circumference) * 2 * math.pi, false, paint);
      startAngle += ((dashWidth + dashSpace) / circumference) * 2 * math.pi;
    }
  }
  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}







