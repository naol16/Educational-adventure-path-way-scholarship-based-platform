import 'package:mobile/features/core/theme/design_system.dart';
import 'dart:ui';
import 'package:flutter/material.dart';


class GlassContainer extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final double borderRadius;
  final double sigma;

  const GlassContainer({
    super.key,
    required this.child,
    this.padding,
    this.borderRadius = 28,
    this.sigma = 15,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: sigma, sigmaY: sigma),
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            color: DesignSystem.glassWhite,
            borderRadius: BorderRadius.circular(borderRadius),
            border: Border.all(
              color: DesignSystem.glassBorder,
              width: 1.2,
            ),
          ),
          child: child,
        ),
      ),
    );
  }
}


