import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:mobile/core/providers/router_provider.dart';
import 'package:mobile/features/core/theme/design_system.dart';

void main() {
  runApp(
    const ProviderScope(
      child: AppRoot(),
    ),
  );
}

class AppRoot extends ConsumerWidget {
  const AppRoot({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'EduPathway',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: DesignSystem.background,
        colorScheme: ColorScheme.fromSeed(
          seedColor: DesignSystem.emerald,
          brightness: Brightness.dark,
          primary: DesignSystem.emerald,
          surface: DesignSystem.background,
        ),
        textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
          displayLarge: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800),
          displayMedium: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800),
          displaySmall: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800),
          headlineLarge: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800),
          headlineMedium: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800),
          headlineSmall: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800),
          titleLarge: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700),
          titleMedium: GoogleFonts.inter(fontWeight: FontWeight.w600),
          bodyLarge: GoogleFonts.inter(),
          bodyMedium: GoogleFonts.inter(),
        ),
        appBarTheme: AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
          centerTitle: true,
          titleTextStyle: GoogleFonts.plusJakartaSans(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
      ),
      routerConfig: router,
    );
  }
}








