import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/providers/dependencies.dart';
import 'package:mobile/features/counselor/models/counselor_models.dart';
import 'package:mobile/features/counselor/services/counselor_app_service.dart';
import 'package:mobile/features/mentors/models/booking_models.dart';

final counselorAppServiceProvider = Provider<CounselorAppService>((ref) {
  return CounselorAppService(ref.watch(apiClientProvider));
});

final counselorProfileProvider = FutureProvider<CounselorProfile?>((ref) async {
  return ref.watch(counselorAppServiceProvider).getMyProfile();
});

final counselorDashboardProvider = FutureProvider<CounselorDashboardOverview?>((ref) async {
  return ref.watch(counselorAppServiceProvider).getDashboardOverview();
});

final counselorUpcomingBookingsProvider = FutureProvider<List<CounselorBooking>>((ref) async {
  return ref.watch(counselorAppServiceProvider).getUpcomingBookings();
});

final counselorStudentsProvider = FutureProvider<List<StudentSummary>>((ref) async {
  return ref.watch(counselorAppServiceProvider).getStudents();
});

final studentProgressProvider = FutureProvider.family<Map<String, dynamic>?, int>((ref, studentId) async {
  return ref.watch(counselorAppServiceProvider).getStudentProgress(studentId);
});

final counselorSlotsProvider = FutureProvider<List<AvailabilitySlot>>((ref) async {
  return ref.watch(counselorAppServiceProvider).getMySlots();
});

final walletLedgerProvider = FutureProvider<List<WalletTransaction>>((ref) async {
  return ref.watch(counselorAppServiceProvider).getWalletLedger();
});

final counselorPayoutsProvider = FutureProvider<List<CounselorPayout>>((ref) async {
  return ref.watch(counselorAppServiceProvider).getMyPayouts();
});

final counselorBanksProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  return ref.watch(counselorAppServiceProvider).getBanks();
});

final counselorDocumentsProvider = FutureProvider<List<SharedDocument>>((ref) async {
  return ref.watch(counselorAppServiceProvider).getDashboardDocuments();
});

final counselorReviewsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  return ref.watch(counselorAppServiceProvider).getReviews();
});
