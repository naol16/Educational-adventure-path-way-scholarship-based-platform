import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:mobile/models/models.dart';
import 'package:mobile/features/scholarships/providers/scholarship_providers.dart';
import 'package:mobile/features/scholarships/screens/scholarship_detail_screen.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';

class TrackedScholarshipsScreen extends ConsumerWidget {
  const TrackedScholarshipsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final watchlistAsync = ref.watch(scholarshipWatchlistProvider);

    return Scaffold(
      backgroundColor: DesignSystem.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: GestureDetector(
            onTap: () => Navigator.pop(context),
            child: GlassContainer(
              padding: const EdgeInsets.all(10),
              borderRadius: 50,
              child: const Icon(LucideIcons.arrowLeft, color: Colors.white, size: 20),
            ),
          ),
        ),
        title: Text(
          "Tracked Applications",
          style: GoogleFonts.plusJakartaSans(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
      ),
      body: Stack(
        children: [
          Positioned(
            top: -50,
            right: -50,
            child: DesignSystem.buildBlurCircle(DesignSystem.emerald.withOpacity(0.05), 250),
          ),
          watchlistAsync.when(
            data: (watchlist) {
              if (watchlist.isEmpty) {
                return Center(
                  child: Text(
                    "You haven't tracked any scholarships yet.",
                    style: GoogleFonts.inter(color: Colors.white54),
                  ),
                );
              }
              return ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                itemCount: watchlist.length,
                itemBuilder: (context, index) {
                  return _buildTrackedCard(context, ref, watchlist[index]);
                },
              );
            },
            loading: () => const Center(child: CircularProgressIndicator(color: DesignSystem.emerald)),
            error: (err, _) => Center(
              child: Text(
                "Error loading watchlist:\n$err",
                style: GoogleFonts.inter(color: Colors.redAccent),
                textAlign: TextAlign.center,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrackedCard(BuildContext context, WidgetRef ref, TrackedScholarship item) {
    // Determine color based on status
    Color statusColor;
    String statusText;
    switch (item.status) {
      case 'APPLIED':
        statusColor = DesignSystem.emerald;
        statusText = 'Applied';
        break;
      case 'SUBMITTED':
        statusColor = Colors.blue;
        statusText = 'Submitted';
        break;
      case 'WATCHING':
        statusColor = Colors.amber;
        statusText = 'Watching';
        break;
      case 'REJECTED':
        statusColor = Colors.redAccent;
        statusText = 'Rejected';
        break;
      case 'ACCEPTED':
        statusColor = Colors.purpleAccent;
        statusText = 'Accepted';
        break;
      default:
        statusColor = Colors.white54;
        statusText = 'Saved';
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 15),
      child: GestureDetector(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ScholarshipDetailScreen(scholarshipId: item.scholarshipId),
            ),
          );
        },
        child: GlassContainer(
          borderRadius: 20,
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: statusColor.withOpacity(0.5)),
                    ),
                    child: Text(
                      statusText,
                      style: GoogleFonts.inter(
                        color: statusColor,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  GestureDetector(
                    onTap: () => _showStatusBottomSheet(context, ref, item.scholarshipId, item.status ?? 'NOT_STARTED'),
                    child: const Icon(LucideIcons.edit2, color: Colors.white54, size: 16),
                  ),
                ],
              ),
              const SizedBox(height: 15),
              Text(
                item.scholarship?.title ?? "Unknown Scholarship",
                style: GoogleFonts.plusJakartaSans(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 5),
              Text(
                item.scholarship?.country ?? "International",
                style: GoogleFonts.inter(color: Colors.white54, fontSize: 12),
              ),
              const SizedBox(height: 15),
              if (item.manualDeadline != null)
                Row(
                  children: [
                    const Icon(LucideIcons.calendar, color: Colors.redAccent, size: 14),
                    const SizedBox(width: 6),
                    Text(
                      "Due: ${item.manualDeadline!.toLocal().toString().split(' ')[0]}",
                      style: GoogleFonts.inter(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }

  void _showStatusBottomSheet(BuildContext context, WidgetRef ref, int scholarshipId, String currentStatus) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return GlassContainer(
          borderRadius: 30,
          padding: const EdgeInsets.all(30),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Update Status",
                style: GoogleFonts.plusJakartaSans(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),
              _buildStatusOption(context, ref, scholarshipId, "NOT_STARTED", "Saved for Later", currentStatus),
              _buildStatusOption(context, ref, scholarshipId, "WATCHING", "Actively Watching", currentStatus),
              _buildStatusOption(context, ref, scholarshipId, "APPLIED", "Applied / In Progress", currentStatus),
              _buildStatusOption(context, ref, scholarshipId, "SUBMITTED", "Submitted", currentStatus),
              _buildStatusOption(context, ref, scholarshipId, "ACCEPTED", "Accepted", currentStatus),
              _buildStatusOption(context, ref, scholarshipId, "REJECTED", "Rejected", currentStatus),
              const SizedBox(height: 20),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatusOption(BuildContext context, WidgetRef ref, int id, String val, String label, String current) {
    final isSelected = val == current;
    return GestureDetector(
      onTap: () async {
        Navigator.pop(context);
        try {
          await ref.read(scholarshipWatchlistProvider.notifier).updateStatus(id, val);
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Status updated successfully')));
          }
        } catch (e) {
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to update: $e')));
          }
        }
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 20),
        decoration: BoxDecoration(
          color: isSelected ? DesignSystem.emerald.withOpacity(0.1) : Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(15),
          border: Border.all(color: isSelected ? DesignSystem.emerald : Colors.transparent),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: GoogleFonts.inter(color: isSelected ? DesignSystem.emerald : Colors.white, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
            if (isSelected) const Icon(LucideIcons.check, color: DesignSystem.emerald, size: 16),
          ],
        ),
      ),
    );
  }
}
