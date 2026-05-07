import 'dart:convert';
import 'package:mobile/core/services/api_client.dart';
import 'package:mobile/features/counselor/models/counselor_models.dart';
import 'package:mobile/features/mentors/models/booking_models.dart';

class CounselorAppService {
  final ApiClient _api;

  CounselorAppService(this._api);

  // ── Profile ──────────────────────────────────────────────────────────────

  Future<CounselorProfile?> getMyProfile() async {
    final res = await _api.get('/api/counselors/me');
    if (res.statusCode == 200) {
      final body = jsonDecode(res.body);
      final data = body['data'] ?? body;
      return CounselorProfile.fromJson(data);
    }
    return null;
  }

  Future<bool> submitApplication(Map<String, dynamic> payload) async {
    final res = await _api.post('/api/counselors/apply', body: payload);
    return res.statusCode == 201 || res.statusCode == 200;
  }

  Future<bool> updateProfile(Map<String, dynamic> payload) async {
    final res = await _api.put('/api/counselors/profile', body: payload);
    return res.statusCode == 200;
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  Future<CounselorDashboardOverview?> getDashboardOverview() async {
    final res = await _api.get('/api/counselors/dashboard/overview');
    if (res.statusCode == 200) {
      final body = jsonDecode(res.body);
      final data = body['data'] ?? body;
      return CounselorDashboardOverview.fromJson(data);
    }
    return null;
  }

  // ── Bookings ──────────────────────────────────────────────────────────────

  Future<List<CounselorBooking>> getUpcomingBookings() async {
    final res = await _api.get('/api/counselors/bookings/upcoming');
    if (res.statusCode == 200) {
      final body = jsonDecode(res.body);
      final List data = body['data'] ?? body ?? [];
      return data.map((e) => CounselorBooking.fromJson(e)).toList();
    }
    return [];
  }

  Future<bool> updateBookingStatus(int bookingId, String status) async {
    final res = await _api.patch('/api/counselors/bookings/$bookingId/status', body: {'status': status});
    return res.statusCode == 200;
  }

  Future<Map<String, dynamic>?> joinSession(int bookingId) async {
    final res = await _api.post('/api/counselors/bookings/$bookingId/join', body: {});
    if (res.statusCode == 200) {
      return jsonDecode(res.body)['data'];
    }
    return null;
  }

  // ── Students ──────────────────────────────────────────────────────────────

  Future<List<StudentSummary>> getStudents() async {
    final res = await _api.get('/api/counselors/students');
    if (res.statusCode == 200) {
      final body = jsonDecode(res.body);
      final List data = body['data'] ?? body ?? [];
      return data.map((e) => StudentSummary.fromJson(e)).toList();
    }
    return [];
  }

  Future<Map<String, dynamic>?> getStudentProgress(int studentId) async {
    final res = await _api.get('/api/counselors/students/$studentId/progress');
    if (res.statusCode == 200) {
      return jsonDecode(res.body)['data'];
    }
    return null;
  }

  // ── Slots ─────────────────────────────────────────────────────────────────

  Future<List<AvailabilitySlot>> getMySlots() async {
    final res = await _api.get('/api/counselors/slots');
    if (res.statusCode == 200) {
      final body = jsonDecode(res.body);
      final List data = body['data'] ?? body ?? [];
      return data.map((e) => AvailabilitySlot.fromJson(e)).toList();
    }
    return [];
  }

  Future<bool> createSlots(List<Map<String, dynamic>> slots) async {
    final res = await _api.post('/api/counselors/slots', body: {'slots': slots});
    return res.statusCode == 201 || res.statusCode == 200;
  }

  Future<bool> deleteSlot(int slotId) async {
    final res = await _api.delete('/api/counselors/slots/$slotId');
    return res.statusCode == 204 || res.statusCode == 200;
  }

  // ── Wallet ────────────────────────────────────────────────────────────────

  Future<List<WalletTransaction>> getWalletLedger() async {
    final res = await _api.get('/api/counselors/me/wallet/ledger');
    if (res.statusCode == 200) {
      final body = jsonDecode(res.body);
      final List data = body['data'] ?? body ?? [];
      return data.map((e) => WalletTransaction.fromJson(e)).toList();
    }
    return [];
  }

  Future<List<CounselorPayout>> getMyPayouts() async {
    final res = await _api.get('/api/counselors/me/payouts');
    if (res.statusCode == 200) {
      final body = jsonDecode(res.body);
      final List data = body['data'] ?? body ?? [];
      return data.map((e) => CounselorPayout.fromJson(e)).toList();
    }
    return [];
  }

  Future<bool> requestPayout({
    required double amount,
    required String bankCode,
    required String accountNumber,
    required String accountName,
    String? bankName,
  }) async {
    final res = await _api.post('/api/counselors/me/payouts/request', body: {
      'amount': amount,
      'payoutMethod': 'bank_transfer',
      'payoutDetails': {
        'accountNumber': accountNumber,
        'bankName': bankName ?? 'Bank',
        'accountHolderName': accountName,
        'bankCode': bankCode,
      },
    });
    return res.statusCode == 201 || res.statusCode == 200;
  }


  Future<List<Map<String, dynamic>>> getBanks() async {
    final res = await _api.get('/api/counselors/banks');
    if (res.statusCode == 200) {
      final body = jsonDecode(res.body);
      final List data = body['data'] ?? [];
      return data.cast<Map<String, dynamic>>();
    }
    return [];
  }

  // ── Documents ─────────────────────────────────────────────────────────────

  Future<List<SharedDocument>> getDashboardDocuments() async {
    final res = await _api.get('/api/counselors/dashboard/documents');
    if (res.statusCode == 200) {
      final body = jsonDecode(res.body);
      final List data = body['data'] ?? body ?? [];
      return data.map((e) => SharedDocument.fromJson(e)).toList();
    }
    return [];
  }
  Future<bool> shareDocument({
    required String title,
    required String url,
    int? studentId,
  }) async {
    final res = await _api.post('/api/counselors/dashboard/documents/share', body: {
      'title': title,
      'url': url,
      if (studentId != null) 'studentId': studentId,
    });
    return res.statusCode == 201 || res.statusCode == 200;
  }

  Future<List<Map<String, dynamic>>> getReviews() async {
    final res = await _api.get('/api/counselors/me/reviews');
    if (res.statusCode == 200) {
      final body = jsonDecode(res.body);
      final summary = body['data'] ?? body;
      final List reviews = summary['reviews'] ?? [];
      return reviews.cast<Map<String, dynamic>>();
    }
    return [];
  }
  Future<bool> rescheduleBooking(int bookingId, int slotId) async {
    final res = await _api.patch('/api/counselors/bookings/$bookingId/reschedule', body: {'slotId': slotId});
    return res.statusCode == 200;
  }
  Future<bool> updateBookingNotes(int bookingId, String notes) async {
    final res = await _api.patch('/api/counselors/bookings/$bookingId/notes', body: {'notes': notes});
    return res.statusCode == 200;
  }
}
