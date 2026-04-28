import 'dart:convert';
import 'package:mobile/core/services/api_client.dart';
import 'package:mobile/features/mentors/models/counselor.dart';
import 'package:mobile/features/mentors/models/booking_models.dart';

class CounselorService {
  final ApiClient _apiClient;

  CounselorService(this._apiClient);

  Future<List<Counselor>> getRecommendedCounselors() async {
    final response = await _apiClient.get('/api/counselors/recommendations/me');
    if (response.statusCode == 200) {
      final body = jsonDecode(response.body);
      final List data = body is List ? body : (body['data'] ?? []);
      return data.map((json) => Counselor.fromJson(json)).toList();
    }
    return [];
  }

  Future<Counselor?> getCounselorById(int id) async {
    final response = await _apiClient.get('/api/counselors/by-user/$id');
    if (response.statusCode == 200) {
      final body = jsonDecode(response.body);
      final data = body is Map && body.containsKey('data') ? body['data'] : body;
      return Counselor.fromJson(data);
    }
    return null;
  }

  Future<List<AvailabilitySlot>> getAvailableSlots(int counselorId) async {
    final response = await _apiClient.get('/api/counselors/$counselorId/slots', query: {'status': 'available'});
    if (response.statusCode == 200) {
      final List data = jsonDecode(response.body)['data'];
      return data.map((json) => AvailabilitySlot.fromJson(json)).toList();
    }
    return [];
  }

  Future<Booking?> createBooking(int counselorId, int slotId, {String? notes}) async {
    final response = await _apiClient.post('/api/counselors/bookings', body: {
      'counselorId': counselorId,
      'slotId': slotId,
      'notes': notes,
    });
    if (response.statusCode == 201) {
      return Booking.fromJson(jsonDecode(response.body)['data']);
    }
    return null;
  }
}
