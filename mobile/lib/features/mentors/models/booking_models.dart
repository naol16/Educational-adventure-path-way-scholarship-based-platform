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

class Booking {
  final int id;
  final int studentId;
  final int counselorId;
  final int slotId;
  final String status; // 'pending', 'confirmed', 'started', 'completed', etc.
  final String? meetingLink;
  final String? notes;
  final AvailabilitySlot? slot;

  Booking({
    required this.id,
    required this.studentId,
    required this.counselorId,
    required this.slotId,
    required this.status,
    this.meetingLink,
    this.notes,
    this.slot,
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
    );
  }
}
