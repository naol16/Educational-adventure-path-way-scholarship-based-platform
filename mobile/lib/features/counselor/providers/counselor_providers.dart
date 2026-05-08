import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
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

class CounselorGoalsNotifier extends StateNotifier<List<CounselorGoal>> {
  CounselorGoalsNotifier() : super([]) {
    _loadGoals();
  }

  static const _storageKey = 'counselor_goals';
  final _storage = const FlutterSecureStorage();

  Future<void> _loadGoals() async {
    try {
      final data = await _storage.read(key: _storageKey);
      if (data != null) {
        final List decoded = jsonDecode(data);
        state = decoded.map((e) => CounselorGoal.fromJson(e)).toList();
      }
    } catch (e) {
      debugPrint('Error loading goals: $e');
    }
  }

  Future<void> _saveGoals() async {
    try {
      final encoded = jsonEncode(state.map((e) => e.toJson()).toList());
      await _storage.write(key: _storageKey, value: encoded);
    } catch (e) {
      debugPrint('Error saving goals: $e');
    }
  }

  void addGoal(String text) {
    if (text.trim().isEmpty) return;
    final newGoal = CounselorGoal(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      text: text,
      createdAt: DateTime.now(),
    );
    state = [newGoal, ...state];
    _saveGoals();
  }

  void toggleGoal(String id) {
    state = state.map((g) => g.id == id ? g.copyWith(isCompleted: !g.isCompleted) : g).toList();
    _saveGoals();
  }

  void removeGoal(String id) {
    state = state.where((g) => g.id != id).toList();
    _saveGoals();
  }
}

final counselorGoalsProvider = StateNotifierProvider<CounselorGoalsNotifier, List<CounselorGoal>>((ref) {
  return CounselorGoalsNotifier();
});
