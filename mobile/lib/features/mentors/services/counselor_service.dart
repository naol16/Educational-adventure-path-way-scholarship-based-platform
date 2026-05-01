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

  Future<Map<String, dynamic>?> createBooking(int counselorId, int slotId, {String? notes}) async {
    final response = await _apiClient.post('/api/counselors/bookings', body: {
      'counselorId': counselorId,
      'slotId': slotId,
      if (notes != null && notes.isNotEmpty) 'notes': notes,
    });
    if (response.statusCode == 201) {
      final body = jsonDecode(response.body);
      final data = body['data'];
      return {
        'booking': Booking.fromJson(data['booking']),
        'checkoutUrl': data['checkoutUrl'],
      };
    }
    return null;
  }

  Future<List<Counselor>> getDirectory({String? specialization, String? country}) async {
    final response = await _apiClient.get('/api/counselors/directory', query: {
      if (specialization != null) 'specialization': specialization,
      if (country != null) 'country': country,
    });
    if (response.statusCode == 200) {
      final List data = jsonDecode(response.body)['data'];
      return data.map((json) => Counselor.fromJson(json)).toList();
    }
    return [];
  }

  Future<Map<String, dynamic>?> verifyPayment(String txRef) async {
    final response = await _apiClient.get('/api/payments/verify/$txRef');
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return null;
  }

  Future<List<Booking>> getMyBookings() async {
    final response = await _apiClient.get('/api/counselors/student/bookings');
    if (response.statusCode == 200) {
      final List data = jsonDecode(response.body)['data'];
      return data.map((json) => Booking.fromJson(json)).toList();
    }
    return [];
  }

  Future<bool> reviewAndConfirmBooking(int bookingId, int rating, String? comment) async {
    final response = await _apiClient.post('/api/counselors/bookings/$bookingId/review-confirm', body: {
      'rating': rating,
      if (comment != null) 'comment': comment,
    });
    return response.statusCode == 200;
  }


  Future<List<Review>> getCounselorReviews(int counselorId) async {
    final response = await _apiClient.get('/api/counselors/$counselorId/reviews');
    if (response.statusCode == 200) {
      final body = jsonDecode(response.body);
      // Backend returns { data: { reviews: [...], totalReviews, averageRating, ... } }
      final data = body['data'];
      final List reviewsList = (data is Map ? data['reviews'] : data) ?? [];
      return reviewsList.map((json) => Review.fromJson(json)).toList();
    }
    return [];
  }
}
