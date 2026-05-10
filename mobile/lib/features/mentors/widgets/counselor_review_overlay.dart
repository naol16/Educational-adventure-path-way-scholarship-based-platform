import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/mentors/models/booking_models.dart';
import 'package:mobile/features/mentors/providers/mentors_providers.dart';

class CounselorReviewOverlay extends ConsumerStatefulWidget {
  final Booking booking;
  final VoidCallback onSuccess;

  const CounselorReviewOverlay({
    super.key,
    required this.booking,
    required this.onSuccess,
  });

  static void show(BuildContext context, Booking booking, VoidCallback onSuccess) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => CounselorReviewOverlay(
        booking: booking,
        onSuccess: onSuccess,
      ),
    );
  }

  @override
  ConsumerState<CounselorReviewOverlay> createState() => _CounselorReviewOverlayState();
}

class _CounselorReviewOverlayState extends ConsumerState<CounselorReviewOverlay> {
  int _rating = 5;
  final _commentController = TextEditingController();
  bool _isSubmitting = false;

  final Color _emerald = const Color(0xFF10B981);

  @override
  Widget build(BuildContext context) {
    final counselor = widget.booking.counselor;

    return Container(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 32,
        bottom: MediaQuery.of(context).viewInsets.bottom + 32,
      ),
      decoration: BoxDecoration(
        color: DesignSystem.themeBackground(context).withValues(alpha: 0.95),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 40,
            spreadRadius: 10,
          )
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: DesignSystem.labelText(context).withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 24),

          // Counselor Summary
          Row(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: _emerald.withValues(alpha: 0.3), width: 2),
                  image: counselor?.profileImageUrl != null
                      ? DecorationImage(
                          image: NetworkImage(counselor!.profileImageUrl!),
                          fit: BoxFit.cover,
                        )
                      : null,
                ),
                child: counselor?.profileImageUrl == null
                    ? Icon(LucideIcons.user, color: _emerald, size: 30)
                    : null,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Review Session',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: _emerald,
                        letterSpacing: 1.2,
                      ),
                    ),
                    Text(
                      counselor?.name ?? 'Counselor',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: DesignSystem.mainText(context),
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(LucideIcons.x),
                style: IconButton.styleFrom(
                  backgroundColor: DesignSystem.surface(context),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 32),

          // Escrow Warning
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: _emerald.withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: _emerald.withValues(alpha: 0.1)),
            ),
            child: Row(
              children: [
                Icon(LucideIcons.shieldCheck, color: _emerald, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Confirming will release the escrow funds to the counselor.',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: DesignSystem.mainText(context).withValues(alpha: 0.7),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),

          // Rating
          Text(
            'HOW WAS YOUR EXPERIENCE?',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 12,
              fontWeight: FontWeight.w900,
              color: DesignSystem.labelText(context),
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(5, (index) {
              final starIndex = index + 1;
              final isSelected = starIndex <= _rating;
              return GestureDetector(
                onTap: () => setState(() => _rating = starIndex),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.symmetric(horizontal: 6),
                  child: Icon(
                    isSelected ? Icons.star_rounded : Icons.star_outline_rounded,
                    size: 44,
                    color: isSelected ? _emerald : DesignSystem.labelText(context).withValues(alpha: 0.2),
                  ),
                ),
              );
            }),
          ),
          const SizedBox(height: 32),

          // Comment
          Align(
            alignment: Alignment.centerLeft,
            child: Text(
              'ADDITIONAL FEEDBACK',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 12,
                fontWeight: FontWeight.w900,
                color: DesignSystem.labelText(context),
                letterSpacing: 1.5,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Container(
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white10),
            ),
            child: TextField(
              controller: _commentController,
              maxLines: 4,
              style: GoogleFonts.inter(color: DesignSystem.mainText(context)),
              decoration: InputDecoration(
                hintText: 'Share your thoughts about the session...',
                hintStyle: GoogleFonts.inter(
                  color: DesignSystem.labelText(context).withValues(alpha: 0.4),
                  fontSize: 14,
                ),
                contentPadding: const EdgeInsets.all(16),
                border: InputBorder.none,
              ),
            ),
          ),
          const SizedBox(height: 40),

          // Submit Button
          Container(
            width: double.infinity,
            height: 58,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [_emerald, const Color(0xFF059669)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(18),
              boxShadow: [
                BoxShadow(
                  color: _emerald.withValues(alpha: 0.3),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                )
              ],
            ),
            child: ElevatedButton(
              onPressed: _isSubmitting ? null : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 3,
                      ),
                    )
                  : Text(
                      'CONFIRM COMPLETION & RATE',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        letterSpacing: 1.2,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  void _submit() async {
    setState(() => _isSubmitting = true);

    try {
      final success = await ref.read(counselorServiceProvider).reviewAndConfirmBooking(
            widget.booking.id,
            _rating,
            _commentController.text.trim().isNotEmpty ? _commentController.text.trim() : null,
          );

      if (!mounted) return;
      setState(() => _isSubmitting = false);

      if (success) {
        widget.onSuccess();
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Session confirmed and funds released!',
              style: GoogleFonts.inter(fontWeight: FontWeight.bold),
            ),
            backgroundColor: _emerald,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      } else {
        throw Exception('Submission failed');
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Failed to submit review. Please try again.',
            style: GoogleFonts.inter(fontWeight: FontWeight.bold),
          ),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }
}
