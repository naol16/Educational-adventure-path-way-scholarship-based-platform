import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/scholarships/models/scholarship.dart';
import 'package:mobile/features/scholarships/providers/scholarship_providers.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:google_fonts/google_fonts.dart';

const bool kScholarshipMapsEnabled = false;

class ScholarshipMapScreen extends ConsumerStatefulWidget {
  const ScholarshipMapScreen({super.key});

  @override
  ConsumerState<ScholarshipMapScreen> createState() =>
      _ScholarshipMapScreenState();
}

class _ScholarshipDetailCard extends StatelessWidget {
  final MatchedScholarship scholarship;
  final VoidCallback onTap;

  const _ScholarshipDetailCard({
    required this.scholarship,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(20),
      child: GlassContainer(
        padding: const EdgeInsets.all(20),
        borderRadius: 24,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: DesignSystem.primary(context).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: DesignSystem.primary(
                        context,
                      ).withValues(alpha: 0.2),
                    ),
                  ),
                  child: Text(
                    scholarship.fundType ?? "Scholarship",
                    style: GoogleFonts.plusJakartaSans(
                      color: DesignSystem.primary(context),
                      fontWeight: FontWeight.bold,
                      fontSize: 10,
                    ),
                  ),
                ),
                const Spacer(),
                Text(
                  "${scholarship.matchScore}% Match",
                  style: GoogleFonts.plusJakartaSans(
                    color: DesignSystem.primary(context),
                    fontWeight: FontWeight.w900,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              scholarship.title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: DesignSystem.headingStyle(
                buildContext: context,
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(
                  LucideIcons.mapPin,
                  size: 14,
                  color: DesignSystem.subText(context),
                ),
                const SizedBox(width: 6),
                Text(
                  scholarship.university ?? scholarship.country ?? "Global",
                  style: DesignSystem.labelStyle(
                    buildContext: context,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onTap,
                style: ElevatedButton.styleFrom(
                  backgroundColor: DesignSystem.primary(context),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  "VIEW DETAILS",
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ScholarshipMapScreenState extends ConsumerState<ScholarshipMapScreen> {
  GoogleMapController? _controller;
  MatchedScholarship? _selectedScholarship;

  // Custom Dark Mode Map Style
  static const String _darkMapStyle = '''
[
  { "elementType": "geometry", "stylers": [{ "color": "#0f172a" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#94a3b8" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#0f172a" }] },
  { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#334155" }] },
  { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#64748b" }] },
  { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [{ "color": "#0b1120" }] },
  { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#0f172a" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#0f172a" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#020617" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#1e293b" }] }
]
''';

  @override
  Widget build(BuildContext context) {
    final scholarshipsAsync = ref.watch(scholarshipMatchesProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Stack(
        children: [
          scholarshipsAsync.when(
            data: (scholarships) {
              if (!kScholarshipMapsEnabled) {
                return _buildMapFallback(context, scholarships);
              }

              final markers = _buildMarkers(scholarships);
              return GoogleMap(
                initialCameraPosition: const CameraPosition(
                  target: LatLng(20, 0),
                  zoom: 2.5,
                ),
                onMapCreated: (controller) {
                  _controller = controller;
                  _controller!.setMapStyle(_darkMapStyle);
                },
                markers: markers,
                myLocationButtonEnabled: false,
                zoomControlsEnabled: false,
                mapToolbarEnabled: false,
                onTap: (_) {
                  setState(() => _selectedScholarship = null);
                },
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, _) => Center(child: Text("Error: $err")),
          ),

          // Header
          Positioned(
            top: MediaQuery.of(context).padding.top + 10,
            left: 20,
            right: 20,
            child: Row(
              children: [
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: GlassContainer(
                    padding: const EdgeInsets.all(12),
                    borderRadius: 16,
                    child: Icon(
                      LucideIcons.arrowLeft,
                      color: DesignSystem.mainText(context),
                      size: 20,
                    ),
                  ),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: GlassContainer(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 12,
                    ),
                    borderRadius: 16,
                    child: Row(
                      children: [
                        Icon(
                          LucideIcons.globe,
                          color: DesignSystem.primary(context),
                          size: 18,
                        ),
                        const SizedBox(width: 12),
                        Text(
                          "Global Explorer",
                          style: DesignSystem.headingStyle(
                            buildContext: context,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Selected Scholarship Card
          if (_selectedScholarship != null)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: _ScholarshipDetailCard(
                scholarship: _selectedScholarship!,
                onTap: () {
                  // Navigate to detail
                  // GoRouter.of(context).push('/scholarships/${_selectedScholarship!.id}');
                },
              ),
            ),
        ],
      ),
    );
  }

  Set<Marker> _buildMarkers(List<MatchedScholarship> scholarships) {
    return scholarships
        .where((s) => s.latitude != null && s.longitude != null)
        .map(
          (s) => Marker(
            markerId: MarkerId(s.id.toString()),
            position: LatLng(s.latitude!, s.longitude!),
            onTap: () {
              setState(() => _selectedScholarship = s);
              _controller?.animateCamera(
                CameraUpdate.newLatLngZoom(
                  LatLng(s.latitude!, s.longitude!),
                  6,
                ),
              );
            },
            icon: BitmapDescriptor.defaultMarkerWithHue(
              BitmapDescriptor.hueGreen,
            ),
          ),
        )
        .toSet();
  }

  Widget _buildMapFallback(
    BuildContext context,
    List<MatchedScholarship> scholarships,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: Column(
        children: [
          Text(
            'Map preview disabled for free usage.',
            style: DesignSystem.headingStyle(
              buildContext: context,
              fontSize: 20,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Expanded(
            child: ListView.builder(
              itemCount: scholarships.length,
              itemBuilder: (context, index) {
                final scholarship = scholarships[index];
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: GlassContainer(
                    padding: const EdgeInsets.all(16),
                    borderRadius: 20,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          scholarship.title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: DesignSystem.headingStyle(
                            buildContext: context,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(
                              LucideIcons.mapPin,
                              size: 14,
                              color: DesignSystem.primary(context),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                scholarship.university ??
                                    scholarship.country ??
                                    'Location unknown',
                                style: DesignSystem.labelStyle(
                                  buildContext: context,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
