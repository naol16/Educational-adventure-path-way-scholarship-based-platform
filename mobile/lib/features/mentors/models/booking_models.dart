class AvailabilitySlot {
  final int id;
  final int counselorId;
  final DateTime startTime;
  final DateTime endTime;
  final String status; // 'available', 'booked', 'cancelled'
  final String? meetingLink;

  AvailabilitySlot({
    required this.id,
    required this.counselorId,
    required this.startTime,
    required this.endTime,
    required this.status,
    this.meetingLink,
  });

  factory AvailabilitySlot.fromJson(Map<String, dynamic> json) {
    return AvailabilitySlot(
      id: json['id'],
      counselorId: json['counselorId'],
      startTime: DateTime.parse(json['startTime']),
      endTime: DateTime.parse(json['endTime']),
      status: json['status'],
      meetingLink: json['meetingLink'],
    );
  }
}

class BookingCounselor {
  final int id;
  final String name;
  final List<String> areasOfExpertise;
  final String? profileImageUrl;

  BookingCounselor({
    required this.id,
    required this.name,
    required this.areasOfExpertise,
    this.profileImageUrl,
  });

  factory BookingCounselor.fromJson(Map<String, dynamic> json) {
    List<String> _parseList(dynamic value) {
      if (value == null) return [];
      if (value is List) return value.map((e) => e.toString().trim()).toList();
      final str = value.toString().trim();
      return str.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
    }

    return BookingCounselor(
      id: json['id'],
      name: json['name'] ?? 'Academic Counselor',
      areasOfExpertise: _parseList(json['areasOfExpertise']),
      profileImageUrl: json['user']?['profileImageUrl'] ?? json['user']?['avatarUrl'],
    );
  }
}

class PaymentInfo {
  final int id;
  final double amount;
  final String currency;
  final String status;
  final String? txRef;

  PaymentInfo({
    required this.id,
    required this.amount,
    required this.currency,
    required this.status,
    this.txRef,
  });

  factory PaymentInfo.fromJson(Map<String, dynamic> json) {
    return PaymentInfo(
      id: json['id'],
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] ?? 'ETB',
      status: json['status'],
      txRef: json['tx_ref'],
    );
  }
}

class Booking {
  final int id;
  final int studentId;
  final int counselorId;
  final int slotId;
  final String status; // 'pending', 'confirmed', 'started', 'completed', 'awaiting_confirmation', etc.
  final String? meetingLink;
  final String? notes;
  final AvailabilitySlot? slot;
  final BookingCounselor? counselor;
  final PaymentInfo? payment;
  final DateTime createdAt;

  Booking({
    required this.id,
    required this.studentId,
    required this.counselorId,
    required this.slotId,
    required this.status,
    required this.createdAt,
    this.meetingLink,
    this.notes,
    this.slot,
    this.counselor,
    this.payment,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'],
      studentId: json['studentId'],
      counselorId: json['counselorId'],
      slotId: json['slotId'],
      status: json['status'],
      meetingLink: json['meetingLink'],
      notes: json['notes'],
      slot: json['slot'] != null ? AvailabilitySlot.fromJson(json['slot']) : null,
      counselor: json['counselor'] != null ? BookingCounselor.fromJson(json['counselor']) : null,
      payment: json['payment'] != null ? PaymentInfo.fromJson(json['payment']) : null,
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
    );
  }
}

class Review {
  final int id;
  final int studentId;
  final int? bookingId;
  final int counselorId;
  final String? studentName;
  final int rating;
  final String? comment;
  final DateTime createdAt;

  Review({
    required this.id,
    required this.studentId,
    this.bookingId,
    required this.counselorId,
    this.studentName,
    required this.rating,
    this.comment,
    required this.createdAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'] ?? 0,
      studentId: json['studentId'] ?? 0,
      bookingId: json['bookingId'],
      counselorId: json['counselorId'] ?? 0,
      studentName: json['studentName'] ?? json['student']?['name'] ?? 'Anonymous',
      rating: json['rating'] ?? 0,
      comment: json['comment'],
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
    );
  }
}

