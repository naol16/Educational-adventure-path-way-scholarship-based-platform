import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';

class CarouselSlide {
  final String title;
  final String description;
  final String imageUrl;

  CarouselSlide({
    required this.title,
    required this.description,
    required this.imageUrl,
  });
}

class LandingScreen extends StatefulWidget {
  const LandingScreen({super.key});

  @override
  State<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  Timer? _autoPlayTimer;

  final List<CarouselSlide> _slides = [
    CarouselSlide(
      title: 'Precision Discovery',
      description: 'Unlock your academic potential with our hyper-accurate AI-driven scholarship matching engine.',
      imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800',
    ),
    CarouselSlide(
      title: 'Verified Mentorship',
      description: 'Unlock expert guidance with total peace of mind. Every transaction is protected by secure escrow.',
      imageUrl: 'https://images.unsplash.com/photo-1521791136364-798a7bc0d262?q=80&w=800',
    ),
    CarouselSlide(
      title: 'Academic Mastery',
      description: 'Master your exams with personalized IELTS & TOEFL training built to bridge your skill gaps.',
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800',
    ),
    CarouselSlide(
      title: 'AI Speaking Lab',
      description: 'Speak with confidence. Practice with our real-time mock interview simulator and get instant AI feedback.',
      imageUrl: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?q=80&w=800',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _startAutoPlay();
  }

  @override
  void dispose() {
    _autoPlayTimer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  void _startAutoPlay() {
    _autoPlayTimer?.cancel();
    _autoPlayTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      if (_currentPage < _slides.length - 1) {
        _currentPage++;
      } else {
        _currentPage = 0;
      }
      _pageController.animateToPage(
        _currentPage,
        duration: const Duration(milliseconds: 600),
        curve: Curves.easeInOut,
      );
    });
  }

  void _onPageChanged(int index) {
    setState(() {
      _currentPage = index;
    });
    // Reset timer on manual swipe to prevent double-swiping
    _startAutoPlay();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Stack(
        children: [
          // Background Glows
          Positioned(
            top: -100,
            right: -100,
            child: DesignSystem.buildBlurCircle(
              DesignSystem.emerald.withValues(alpha: 0.12),
              350,
            ),
          ),
          Positioned(
            bottom: -50,
            left: -100,
            child: DesignSystem.buildBlurCircle(
              const Color(0xFF6366F1).withValues(alpha: 0.08),
              300,
            ),
          ),

          SafeArea(
            child: Column(
              children: [
                // Top Bar with Skip
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      TextButton(
                        onPressed: () => context.push('/role-selection'),
                        child: Text(
                          'SKIP',
                          style: GoogleFonts.plusJakartaSans(
                            color: Colors.white54,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.2,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Carousel
                Expanded(
                  child: PageView.builder(
                    controller: _pageController,
                    onPageChanged: _onPageChanged,
                    itemCount: _slides.length,
                    itemBuilder: (context, index) {
                      return _buildSlide(_slides[index]);
                    },
                  ),
                ),

                // Indicators
                Padding(
                  padding: const EdgeInsets.only(bottom: 40),
                  child: SmoothPageIndicator(
                    controller: _pageController,
                    count: _slides.length,
                    effect: const ExpandingDotsEffect(
                      dotHeight: 8,
                      dotWidth: 8,
                      spacing: 8,
                      expansionFactor: 4,
                      dotColor: Colors.white24,
                      activeDotColor: Color(0xFF10B981),
                    ),
                  ),
                ),

                // Bottom Button
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 0, 24, 48),
                  child: _buildActionButton(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSlide(CarouselSlide slide) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Image with subtle inner glow/shadow and large radius
          Container(
            height: 320,
            width: double.infinity,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(30),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF10B981).withValues(alpha: 0.2),
                  blurRadius: 30,
                  spreadRadius: -10,
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(30),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(
                    slide.imageUrl,
                    fit: BoxFit.cover,
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return Container(
                        color: Colors.white.withOpacity(0.05),
                        child: const Center(
                          child: CircularProgressIndicator(color: Color(0xFF10B981)),
                        ),
                      );
                    },
                  ),
                  // Subtle gradient overlay for better text contrast if needed
                  // but we place text below, so this is for depth
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withValues(alpha: 0.3),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 48),
          
          Text(
            slide.title,
            textAlign: TextAlign.center,
            style: GoogleFonts.plusJakartaSans(
              color: Colors.white,
              fontSize: 32,
              fontWeight: FontWeight.w800,
              height: 1.1,
            ),
          ),
          const SizedBox(height: 16),
          
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Text(
              slide.description,
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                color: Colors.white70,
                fontSize: 16,
                height: 1.6,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton() {
    final isLastPage = _currentPage == _slides.length - 1;
    
    return Container(
      width: double.infinity,
      height: 60,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: const LinearGradient(
          colors: [Color(0xFF10B981), Color(0xFF059669)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF10B981).withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            if (isLastPage) {
              context.push('/role-selection');
            } else {
              _pageController.nextPage(
                duration: const Duration(milliseconds: 600),
                curve: Curves.easeInOut,
              );
            }
          },
          borderRadius: BorderRadius.circular(16),
          child: Center(
            child: Text(
              isLastPage ? 'START ADVENTURE' : 'NEXT',
              style: GoogleFonts.plusJakartaSans(
                color: Colors.black,
                fontWeight: FontWeight.w900,
                fontSize: 15,
                letterSpacing: 1.2,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
