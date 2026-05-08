import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/counselor/providers/counselor_providers.dart';
import 'package:mobile/features/counselor/models/counselor_models.dart';

class CounselorReviewsScreen extends ConsumerWidget {
  const CounselorReviewsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reviewsAsync = ref.watch(counselorReviewsProvider);
    final primary = DesignSystem.primary(context);

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(context),
            const SizedBox(height: 16),
            Expanded(
              child: RefreshIndicator(
                onRefresh: () async => ref.invalidate(counselorReviewsProvider),
                color: primary,
                child: reviewsAsync.when(
                  data: (data) {
                    final reviews = data.map((e) => CounselorReview.fromJson(e)).toList();
                    if (reviews.isEmpty) return _buildEmpty(context);
                    
                    return ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      itemCount: reviews.length + 1,
                      itemBuilder: (ctx, i) {
                        if (i == 0) return _buildSummaryHeader(context, reviews);
                        return _buildReviewCard(context, reviews[i - 1]);
                      },
                    );
                  },
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (e, _) => Center(child: Text('Error loading reviews')),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Reviews & Ratings', style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 24, fontWeight: FontWeight.w800)),
                Text('What students say about you', style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 13)),
              ],
            ),
          ),
          Icon(LucideIcons.star, color: const Color(0xFFF59E0B), size: 24),
        ],
      ),
    );
  }

  Widget _buildSummaryHeader(BuildContext context, List<CounselorReview> reviews) {
    if (reviews.isEmpty) return const SizedBox.shrink();

    final totalReviews = reviews.length;
    final averageRating = reviews.map((r) => r.rating).reduce((a, b) => a + b) / totalReviews;
    
    final Map<int, int> distribution = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
    for (var r in reviews) {
      if (distribution.containsKey(r.rating)) {
        distribution[r.rating] = distribution[r.rating]! + 1;
      }
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 24, top: 8),
      child: GlassContainer(
        padding: const EdgeInsets.all(24),
        borderRadius: 28,
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  flex: 2,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        averageRating.toStringAsFixed(1),
                        style: GoogleFonts.plusJakartaSans(
                          color: DesignSystem.mainText(context),
                          fontSize: 48,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      Row(
                        children: List.generate(5, (index) => Icon(
                          LucideIcons.star,
                          size: 14,
                          color: index < averageRating.round() ? const Color(0xFFF59E0B) : DesignSystem.labelText(context).withValues(alpha: 0.2),
                          fill: index < averageRating.round() ? 1.0 : 0.0,
                        )),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '$totalReviews VERIFIED REVIEWS',
                        style: GoogleFonts.inter(
                          color: DesignSystem.labelText(context),
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 24),
                Expanded(
                  flex: 3,
                  child: Column(
                    children: [5, 4, 3, 2, 1].map((star) {
                      final count = distribution[star] ?? 0;
                      final percent = totalReviews > 0 ? count / totalReviews : 0.0;
                      return _buildDistributionBar(context, star, percent);
                    }).toList(),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            const Divider(height: 1),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildSentimentChip(context, 'Professional', LucideIcons.shieldCheck, const Color(0xFF10B981)),
                _buildSentimentChip(context, 'Expert Advice', LucideIcons.award, const Color(0xFF3B82F6)),
                _buildSentimentChip(context, 'Fast Response', LucideIcons.zap, const Color(0xFFF59E0B)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDistributionBar(BuildContext context, int star, double percent) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Text('$star', style: GoogleFonts.inter(color: DesignSystem.mainText(context), fontSize: 10, fontWeight: FontWeight.bold)),
          const SizedBox(width: 4),
          Icon(LucideIcons.star, size: 10, color: const Color(0xFFF59E0B)),
          const SizedBox(width: 8),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: percent,
                minHeight: 6,
                backgroundColor: DesignSystem.labelText(context).withValues(alpha: 0.1),
                valueColor: AlwaysStoppedAnimation<Color>(DesignSystem.primary(context)),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Text('${(percent * 100).toInt()}%', style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 9, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildSentimentChip(BuildContext context, String label, IconData icon, Color color) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 16),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: GoogleFonts.inter(
            color: DesignSystem.mainText(context),
            fontSize: 9,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }

  Widget _buildReviewCard(BuildContext context, CounselorReview review) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: GlassContainer(
        padding: const EdgeInsets.all(18),
        borderRadius: 22,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 18,
                      backgroundColor: DesignSystem.primary(context).withValues(alpha: 0.1),
                      child: Text(review.studentName.substring(0, 1).toUpperCase(), style: GoogleFonts.plusJakartaSans(color: DesignSystem.primary(context), fontWeight: FontWeight.w800, fontSize: 14)),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(review.studentName, style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontWeight: FontWeight.w700, fontSize: 14)),
                        Text(DateFormat('MMM d, yyyy').format(review.createdAt), style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 11)),
                      ],
                    ),
                  ],
                ),
                _buildRatingBadge(review.rating),
              ],
            ),
            if (review.comment != null && review.comment!.isNotEmpty) ...[
              const SizedBox(height: 14),
              Text(
                review.comment!,
                style: GoogleFonts.inter(color: DesignSystem.subText(context), fontSize: 13, height: 1.5),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildRatingBadge(int rating) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: const Color(0xFFF59E0B).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(LucideIcons.star, color: Color(0xFFF59E0B), size: 12),
          const SizedBox(width: 4),
          Text('$rating.0', style: GoogleFonts.inter(color: const Color(0xFFF59E0B), fontSize: 11, fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }

  Widget _buildEmpty(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.messageSquare, color: DesignSystem.labelText(context), size: 56),
          const SizedBox(height: 16),
          Text('No reviews yet', style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 18, fontWeight: FontWeight.w700)),
          Text('Complete sessions to receive feedback.', style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 13)),
        ],
      ),
    );
  }
}
