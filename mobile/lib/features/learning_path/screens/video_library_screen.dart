import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/learning_path/models/learning_path.dart';
import 'package:mobile/features/learning_path/providers/learning_path_provider.dart';
import 'package:mobile/features/learning_path/screens/resource_viewer_screen.dart';

class VideoLibraryScreen extends ConsumerWidget {
  final List<PathVideo> videos;
  final String skillName;

  const VideoLibraryScreen({
    super.key,
    required this.videos,
    required this.skillName,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Group videos by level
    final groupedVideos = <String, List<PathVideo>>{
      'easy': videos.where((v) => v.level.toLowerCase() == 'easy').toList(),
      'medium': videos.where((v) => v.level.toLowerCase() == 'medium').toList(),
      'hard': videos.where((v) => v.level.toLowerCase() == 'hard').toList(),
    };

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          "$skillName Library",
          style: DesignSystem.headingStyle(buildContext: context, fontSize: 18),
        ),
        leading: IconButton(
          icon: Icon(LucideIcons.arrowLeft, color: DesignSystem.mainText(context)),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          if (groupedVideos['easy']!.isNotEmpty)
            _buildLevelSection(context, ref, "Beginner (Easy)", groupedVideos['easy']!, DesignSystem.emerald),
          
          if (groupedVideos['medium']!.isNotEmpty)
            _buildLevelSection(context, ref, "Intermediate (Medium)", groupedVideos['medium']!, Colors.amber),
          
          if (groupedVideos['hard']!.isNotEmpty)
            _buildLevelSection(context, ref, "Advanced (Hard)", groupedVideos['hard']!, Colors.red),
        ],
      ),
    );
  }

  Widget _buildLevelSection(BuildContext context, WidgetRef ref, String title, List<PathVideo> levelVideos, Color accentColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: accentColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: accentColor.withValues(alpha: 0.2)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(LucideIcons.shield, size: 14, color: accentColor),
                  const SizedBox(width: 8),
                  Text(
                    title.toUpperCase(),
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.5,
                      color: accentColor,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        ...levelVideos.map((video) => _buildVideoCard(context, ref, video, accentColor)),
        const SizedBox(height: 32),
      ],
    );
  }

  Widget _buildVideoCard(BuildContext context, WidgetRef ref, PathVideo video, Color accentColor) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: GestureDetector(
        onTap: () async {
          // 1. Open video immediately for zero lag
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ResourceViewerScreen(
                type: ResourceType.video,
                title: video.title ?? "Instructional Lesson",
                url: video.videoLink,
              ),
            ),
          );

          // 2. Mark as completed in background
          ref.read(learningPathProvider.notifier).completeResource(video.id, video.type);
        },
        child: GlassContainer(
          padding: const EdgeInsets.all(12),
          borderRadius: 20,
          child: Row(
            children: [
              // Thumbnail placeholder / Image
              Container(
                width: 100,
                height: 70,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  image: DecorationImage(
                    image: NetworkImage(video.thumbnailLink),
                    fit: BoxFit.cover,
                  ),
                ),
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.5),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(LucideIcons.play, color: Colors.white, size: 16),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      video.title ?? (video.videoLink.contains("watch?v=") 
                        ? "Lesson: ${video.type} Strategy" 
                        : "Educational Content"),
                      style: DesignSystem.headingStyle(buildContext: context, fontSize: 14),
                    ),
                    const SizedBox(height: 4),
                    FittedBox(
                      fit: BoxFit.scaleDown,
                      alignment: Alignment.centerLeft,
                      child: Row(
                        children: [
                          Icon(LucideIcons.clock, size: 12, color: DesignSystem.labelText(context).withValues(alpha: 0.5)),
                          const SizedBox(width: 4),
                          Text(
                            video.duration ?? "${(video.title?.length ?? 10) % 5 + 5}:${(video.id) % 60 < 10 ? '0' : ''}${(video.id) % 60} mins",
                            style: DesignSystem.labelStyle(buildContext: context, fontSize: 10).copyWith(
                              color: DesignSystem.labelText(context).withValues(alpha: 0.7),
                            ),
                          ),
                          const SizedBox(width: 12),
                          if (video.isCompleted)
                            Row(
                              children: [
                                Icon(LucideIcons.checkCircle, size: 12, color: DesignSystem.emerald),
                                const SizedBox(width: 4),
                                Text(
                                  "Completed",
                                  style: GoogleFonts.plusJakartaSans(
                                    color: DesignSystem.emerald,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Icon(LucideIcons.chevronRight, color: DesignSystem.labelText(context).withValues(alpha: 0.3), size: 18),
            ],
          ),
        ),
      ),
    );
  }
}
