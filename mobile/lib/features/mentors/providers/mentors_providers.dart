import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/providers/dependencies.dart';
import 'package:mobile/features/mentors/models/counselor.dart';
import 'package:mobile/features/mentors/models/booking_models.dart';
import 'package:mobile/features/mentors/services/counselor_service.dart';

final counselorServiceProvider = Provider<CounselorService>((ref) {
  return CounselorService(ref.watch(apiClientProvider));
});

final recommendedCounselorsProvider = FutureProvider<List<Counselor>>((ref) async {
  return ref.watch(counselorServiceProvider).getRecommendedCounselors();
});

final counselorDetailsProvider = FutureProvider.family<Counselor?, int>((ref, id) async {
  return ref.watch(counselorServiceProvider).getCounselorById(id);
});

final availableSlotsProvider = FutureProvider.family<List<AvailabilitySlot>, int>((ref, counselorId) async {
  return ref.watch(counselorServiceProvider).getAvailableSlots(counselorId);
});

final counselorReviewsProvider = FutureProvider.family<List<Review>, int>((ref, counselorId) async {
  return ref.watch(counselorServiceProvider).getCounselorReviews(counselorId);
});
