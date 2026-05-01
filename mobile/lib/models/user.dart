import 'package:mobile/models/json_utils.dart';

/// Mirrors `/api/auth/me` — user row merged with student/counselor profile fields.
/// Synchronized with @frontend User interface.
class User {
  const User({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.isOnboarded = false,
    this.avatarUrl,
    this.fullName,
    this.gender,
    this.dateOfBirth,
    this.nationality,
    this.countryOfResidence,
    this.city,
    this.phoneNumber,
    this.currentEducationLevel,
    this.degreeSeeking,
    this.fieldOfStudyInput,
    this.previousUniversity,
    this.graduationYear,
    this.gpa,
    this.preferredDegreeLevel,
    this.preferredFundingType,
    this.studyMode,
    this.preferredCountries,
    this.preferredUniversities,
    required this.raw,
  });

  final int id;
  final String email;
  final String name;
  final String role;
  final bool isOnboarded;
  final String? avatarUrl;

  // Profile fields
  final String? fullName;
  final String? gender;
  final String? dateOfBirth;
  final String? nationality;
  final String? countryOfResidence;
  final String? city;
  final String? phoneNumber;
  final String? currentEducationLevel;
  final String? degreeSeeking;
  final List<String>? fieldOfStudyInput;
  final String? previousUniversity;
  final int? graduationYear;
  final double? gpa;

  // Preferences
  final List<String>? preferredDegreeLevel;
  final String? preferredFundingType;
  final String? studyMode;
  final List<String>? preferredCountries;
  final List<dynamic>? preferredUniversities;

  final Map<String, dynamic> raw;

  bool get isStudent => role.toLowerCase() == 'student';
  bool get isCounselor => role.toLowerCase() == 'counselor';
  bool get isAdmin => role.toLowerCase() == 'admin';

  factory User.fromJson(Map<String, dynamic> json) {
    final id = readInt(json, const ['id']);
    if (id == null) {
      throw FormatException('User JSON missing id: $json');
    }

    return User(
      id: id,
      email: readValue<String>(json, const ['email']) ?? '',
      name: readValue<String>(json, const ['name']) ?? '',
      role: readValue<String>(json, const ['role']) ?? 'student',
      isOnboarded: readBool(json, const ['isOnboarded', 'is_onboarded']),
      avatarUrl: readValue<String>(json, const ['avatarUrl', 'avatar_url']),
      fullName: readValue<String>(json, const ['fullName', 'full_name']),
      gender: readValue<String>(json, const ['gender']),
      dateOfBirth: readValue<String>(json, const ['dateOfBirth', 'date_of_birth']),
      nationality: readValue<String>(json, const ['nationality']),
      countryOfResidence: readValue<String>(json, const ['countryOfResidence', 'country_of_residence']),
      city: readValue<String>(json, const ['city']),
      phoneNumber: readValue<String>(json, const ['phoneNumber', 'phone_number']),
      currentEducationLevel: readValue<String>(json, const ['currentEducationLevel', 'current_education_level', 'academicStatus', 'academic_status']),
      degreeSeeking: readValue<String>(json, const ['degreeSeeking', 'degree_seeking']),
      fieldOfStudyInput: readStringList(json, const ['fieldOfStudyInput', 'field_of_study_input', 'fieldOfStudy', 'field_of_study']),
      previousUniversity: readValue<String>(json, const ['previousUniversity', 'previous_university', 'currentUniversity', 'current_university']),
      graduationYear: readInt(json, const ['graduationYear', 'graduation_year']),
      gpa: readDouble(json, const ['gpa', 'calculatedGpa', 'calculated_gpa']),
      preferredDegreeLevel: readStringList(json, const ['preferredDegreeLevel', 'preferred_degree_level']),
      preferredFundingType: readValue<String>(json, const ['preferredFundingType', 'preferred_funding_type']),
      studyMode: readValue<String>(json, const ['studyMode', 'study_mode']),
      preferredCountries: readStringList(json, const ['preferredCountries', 'preferred_countries']),
      preferredUniversities: json['preferredUniversities'] ?? json['preferred_universities'],
      raw: Map<String, dynamic>.from(json),
    );
  }
}







