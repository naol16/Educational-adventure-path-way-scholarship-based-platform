import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class DesignSystem {
  // --- COLORS ---
  static const Color background = Color(0xFF0F172A);
  static const Color emerald = Color(0xFF10B981);
  static const Color glassWhite = Color(0x0FFFFFFF); // white.withOpacity(0.06)
  static const Color glassBorder = Color(0x1AFFFFFF); // white.withOpacity(0.1)
  static const Color cardColor = Color(0x1AFFFFFF); // white.withOpacity(0.1)
  static const Color inputBackground = Color(0x33000000); // black.withOpacity(0.2)

  // --- TYPOGRAPHY ---
  static TextStyle headingStyle({Color color = Colors.white, double fontSize = 28}) {
    return GoogleFonts.plusJakartaSans(
      color: color,
      fontSize: fontSize,
      fontWeight: FontWeight.w800,
      height: 1.2,
    );
  }

  static TextStyle bodyStyle({Color color = Colors.white70, double fontSize = 14}) {
    return GoogleFonts.inter(
      color: color,
      fontSize: fontSize,
    );
  }

  static TextStyle labelStyle({Color color = Colors.white54, double fontSize = 12}) {
    return GoogleFonts.inter(
      color: color,
      fontSize: fontSize,
      fontWeight: FontWeight.w600,
    );
  }

  // --- COMPONENTS ---
  static Widget buildBlurCircle(Color color, double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
        boxShadow: [
          BoxShadow(
            color: color,
            blurRadius: 100,
            spreadRadius: 50,
          )
        ],
      ),
    );
  }
}







