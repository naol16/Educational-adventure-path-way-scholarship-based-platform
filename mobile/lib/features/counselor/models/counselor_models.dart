import 'package:mobile/features/mentors/models/booking_models.dart';
export 'package:mobile/features/mentors/models/booking_models.dart';

// ─── Dashboard Overview ────────────────────────────────────────────────────

class CounselorDashboardOverview {
  final int assignedStudents;
  final int upcomingBookings;
  final int completedSessions;
  final int pendingBookings;

  const CounselorDashboardOverview({
    required this.assignedStudents,
    required this.upcomingBookings,
    required this.completedSessions,
    required this.pendingBookings,
  });

  factory CounselorDashboardOverview.fromJson(Map<String, dynamic> json) {
    return CounselorDashboardOverview(
      assignedStudents: json['assignedStudents'] ?? 0,
      upcomingBookings: json['upcomingBookings'] ?? 0,
      completedSessions: json['completedSessions'] ?? 0,
      pendingBookings: json['pendingBookings'] ?? 0,
    );
  }
}

// ─── Counselor Profile ─────────────────────────────────────────────────────

class CounselorProfile {
  final int id;
  final int userId;
  final String name;
  final String email;
  final String bio;
  final double hourlyRate;
  final int yearsOfExperience;
  final String verificationStatus;
  final bool isActive;
  final bool isOnboarded;
  final double rating;
  final double ratingPercentage;
  final int totalSessions;
  final double pendingBalance;
  final double totalEarned;
  final String? profileImageUrl;
  final String? currentPosition;
  final String? organization;
  final String? phoneNumber;
  final String? countryOfResidence;
  final String? city;
  final List<String> areasOfExpertise;
  final List<String> specializedCountries;
  final List<String> languages;
  final List<String> fieldsOfStudy;
  final List<String> consultationModes;
  final String? universityName;
  final String? highestEducationLevel;
  final String? studyCountry;
  final int sessionDuration;
  final String? cvUrl;
  final String? certificateUrls;
  final String? idCardUrl;
  final String? selfieUrl;
  final String? weeklySchedule;

  const CounselorProfile({
    required this.id,
    required this.userId,
    required this.name,
    required this.email,
    required this.bio,
    required this.hourlyRate,
    required this.yearsOfExperience,
    required this.verificationStatus,
    required this.isActive,
    required this.isOnboarded,
    required this.rating,
    required this.ratingPercentage,
    required this.totalSessions,
    required this.pendingBalance,
    required this.totalEarned,
    this.profileImageUrl,
    this.currentPosition,
    this.organization,
    this.phoneNumber,
    this.countryOfResidence,
    this.city,
    required this.areasOfExpertise,
    required this.specializedCountries,
    required this.languages,
    required this.fieldsOfStudy,
    required this.consultationModes,
    this.universityName,
    this.highestEducationLevel,
    this.studyCountry,
    required this.sessionDuration,
    this.cvUrl,
    this.certificateUrls,
    this.idCardUrl,
    this.selfieUrl,
    this.weeklySchedule,
  });

  factory CounselorProfile.fromJson(Map<String, dynamic> json) {
    List<String> _parseStringList(dynamic val) {
      if (val == null) return [];
      if (val is List) return val.map((e) => e.toString()).toList();
      if (val is String) {
        if (val.startsWith('[')) {
          try {
            return (val.replaceAll('[', '').replaceAll(']', '').replaceAll('"', '').split(',')).map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
          } catch (_) {}
        }
        return val.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
      }
      return [];
    }

    return CounselorProfile(
      id: json['id'] ?? 0,
      userId: json['userId'] ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      bio: json['bio'] ?? '',
      hourlyRate: double.tryParse(json['hourlyRate']?.toString() ?? '0') ?? 0.0,
      yearsOfExperience: json['yearsOfExperience'] ?? 0,
      verificationStatus: json['verificationStatus'] ?? 'pending',
      isActive: json['isActive'] ?? true,
      isOnboarded: json['isOnboarded'] ?? false,
      rating: double.tryParse(json['rating']?.toString() ?? '0') ?? 0.0,
      ratingPercentage: double.tryParse(json['ratingPercentage']?.toString() ?? '0') ?? 0.0,
      totalSessions: json['totalSessions'] ?? 0,
      pendingBalance: double.tryParse(json['pendingBalance']?.toString() ?? '0') ?? 0.0,
      totalEarned: double.tryParse(json['totalEarned']?.toString() ?? '0') ?? 0.0,
      profileImageUrl: json['profileImageUrl'],
      currentPosition: json['currentPosition'],
      organization: json['organization'],
      phoneNumber: json['phoneNumber'],
      countryOfResidence: json['countryOfResidence'],
      city: json['city'],
      areasOfExpertise: _parseStringList(json['areasOfExpertise']),
      specializedCountries: _parseStringList(json['specializedCountries']),
      languages: _parseStringList(json['languages']),
      fieldsOfStudy: _parseStringList(json['fieldsOfStudy']),
      consultationModes: _parseStringList(json['consultationModes']),
      universityName: json['universityName'],
      highestEducationLevel: json['highestEducationLevel'],
      studyCountry: json['studyCountry'],
      sessionDuration: json['sessionDuration'] ?? 60,
      cvUrl: json['cvUrl'],
      certificateUrls: json['certificateUrls'],
      idCardUrl: json['idCardUrl'],
      selfieUrl: json['selfieUrl'],
      weeklySchedule: json['weeklySchedule'],
    );
  }
}

// ─── Counselor Booking (enriched) ─────────────────────────────────────────

class CounselorBooking {
  final int id;
  final String status;
  final String? meetingLink;
  final String? notes;
  final DateTime? createdAt;
  final AvailabilitySlot? slot;
  final StudentSummary? student;

  const CounselorBooking({
    required this.id,
    required this.status,
    this.meetingLink,
    this.notes,
    this.createdAt,
    this.slot,
    this.student,
  });

  factory CounselorBooking.fromJson(Map<String, dynamic> json) {
    return CounselorBooking(
      id: json['id'],
      status: json['status'] ?? 'pending',
      meetingLink: json['meetingLink'],
      notes: json['notes'],
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
      slot: json['slot'] != null ? AvailabilitySlot.fromJson(json['slot']) : null,
      student: json['student'] != null ? StudentSummary.fromJson(json['student']) : null,
    );
  }
}

// ─── Student Summary (for counselor views) ────────────────────────────────

class StudentSummary {
  final int id;
  final int userId;
  final String name;
  final String email;
  final String? avatarUrl;
  final String? fieldOfStudy;
  final String? targetCountry;
  final int sessionCount;
  
  // Additional profile fields
  final String? currentDegree;
  final String? proficiencyScore;
  final String? researchArea;
  final String? desiredFunding;

  const StudentSummary({
    required this.id,
    required this.userId,
    required this.name,
    required this.email,
    this.avatarUrl,
    this.fieldOfStudy,
    this.targetCountry,
    required this.sessionCount,
    this.currentDegree,
    this.proficiencyScore,
    this.researchArea,
    this.desiredFunding,
  });

  factory StudentSummary.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    return StudentSummary(
      id: json['id'] ?? 0,
      userId: user?['id'] ?? json['userId'] ?? 0,
      name: user?['name'] ?? json['name'] ?? 'Student',
      email: user?['email'] ?? json['email'] ?? '',
      avatarUrl: user?['avatarUrl'] ?? json['avatarUrl'],
      fieldOfStudy: json['fieldOfStudy'] ?? json['field_of_study'],
      targetCountry: json['countryInterest'] ?? json['country_interest'],
      sessionCount: json['sessionCount'] ?? json['session_count'] ?? 0,
      currentDegree: json['currentDegree'] ?? json['current_degree'],
      proficiencyScore: json['proficiencyScore'] ?? json['proficiency_score'],
      researchArea: json['researchArea'] ?? json['research_area'],
      desiredFunding: json['desiredFunding'] ?? json['desired_funding'],
    );
  }
}

// ─── Wallet Transaction ────────────────────────────────────────────────────

class WalletTransaction {
  final int id;
  final String type; // 'credit' | 'debit'
  final double amount;
  final String description;
  final DateTime createdAt;

  const WalletTransaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.description,
    required this.createdAt,
  });

  factory WalletTransaction.fromJson(Map<String, dynamic> json) {
    return WalletTransaction(
      id: json['id'],
      type: json['entryType'] ?? json['type'] ?? 'credit',
      amount: double.tryParse(json['amount']?.toString() ?? '0') ?? 0.0,
      description: json['note'] ?? json['description'] ?? '',
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}

// ─── Payout ───────────────────────────────────────────────────────────────

class CounselorPayout {
  final int id;
  final double amount;
  final String status;
  final String? bankName;
  final String? accountNumber;
  final DateTime createdAt;

  const CounselorPayout({
    required this.id,
    required this.amount,
    required this.status,
    this.bankName,
    this.accountNumber,
    required this.createdAt,
  });

  factory CounselorPayout.fromJson(Map<String, dynamic> json) {
    final details = json['payoutDetails'] as Map<String, dynamic>?;
    return CounselorPayout(
      id: json['id'],
      amount: double.tryParse(json['amount']?.toString() ?? '0') ?? 0.0,
      status: json['status'] ?? 'pending',
      bankName: details?['bankName'] ?? json['bankName'] ?? json['bank_name'],
      accountNumber: details?['accountNumber'] ?? json['accountNumber'] ?? json['account_number'],
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}

// ─── Shared Document ──────────────────────────────────────────────────────

class SharedDocument {
  final int id;
  final String title;
  final String? fileUrl;
  final String? sharedWith;
  final DateTime createdAt;

  const SharedDocument({
    required this.id,
    required this.title,
    this.fileUrl,
    this.sharedWith,
    required this.createdAt,
  });

  factory SharedDocument.fromJson(Map<String, dynamic> json) {
    return SharedDocument(
      id: json['id'],
      title: json['title'] ?? json['name'] ?? 'Document',
      fileUrl: json['fileUrl'] ?? json['url'],
      sharedWith: json['sharedWith']?.toString(),
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}

class CounselorReview {
  final int id;
  final int rating;
  final String? comment;
  final String studentName;
  final DateTime createdAt;

  const CounselorReview({
    required this.id,
    required this.rating,
    this.comment,
    required this.studentName,
    required this.createdAt,
  });

  factory CounselorReview.fromJson(Map<String, dynamic> json) {
    return CounselorReview(
      id: json['id'],
      rating: json['rating'] ?? 0,
      comment: json['comment'],
      studentName: json['student']?['name'] ?? json['studentName'] ?? 'Anonymous',
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}
