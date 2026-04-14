import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/models/student_profile_model.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';

import 'dart:convert';

class OnboardingNotifier extends Notifier<StudentProfileModel> {
  List<String> _parseStringList(dynamic value) {
    if (value == null) return [];
    if (value is List) return value.map((e) => e.toString()).toList();
    if (value is String) {
      if (value.isEmpty) return [];
      try {
        final parsed = jsonDecode(value);
        if (parsed is List) return parsed.map((e) => e.toString()).toList();
      } catch (_) {}
    }
    return [];
  }

  List<Map<String, String>> _parseWorkExperience(dynamic value) {
    if (value == null) return [];
    if (value is List) {
      return value.map((e) {
        if (e is Map) {
          return e.map((k, v) => MapEntry(k.toString(), v.toString()));
        }
        return <String, String>{};
      }).toList();
    }
    if (value is String) {
      if (value.isEmpty) return [];
      try {
        final parsed = jsonDecode(value);
        if (parsed is List) {
          return parsed.map((e) {
            if (e is Map) {
              return e.map((k, v) => MapEntry(k.toString(), v.toString()));
            }
            return <String, String>{};
          }).toList();
        }
      } catch (_) {}
    }
    return [];
  }

  @override
  StudentProfileModel build() {
    final user = ref.watch(authProvider).valueOrNull;
    if (user == null) return const StudentProfileModel();

    final raw = user.raw;
    
    // Parse Notification Preferences
    bool emailNotif = true;
    bool inSystemNotif = true;
    final notificationsObj = raw['notificationPreferences'] ?? raw['notification_preferences'];
    if (notificationsObj is Map) {
      emailNotif = notificationsObj['email'] == true;
      inSystemNotif = notificationsObj['inSystem'] == true || notificationsObj['in_system'] == true;
    } else if (notificationsObj is String && notificationsObj.isNotEmpty) {
      try {
        final parsed = jsonDecode(notificationsObj);
        if (parsed is Map) {
          emailNotif = parsed['email'] == true;
          inSystemNotif = parsed['inSystem'] == true || parsed['in_system'] == true;
        }
      } catch (_) {}
    }

    return StudentProfileModel(
      fullName: user.fullName ?? user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      nationality: user.nationality,
      countryOfResidence: user.countryOfResidence,
      city: user.city,
      currentEducationLevel: user.currentEducationLevel,
      degreeSeeking: user.degreeSeeking,
      fieldOfStudyInput: _parseStringList(raw['fieldOfStudy'] ?? raw['field_of_study'] ?? user.fieldOfStudyInput),
      previousUniversity: user.previousUniversity,
      graduationYear: user.graduationYear,
      gpa: user.gpa,
      languageTestType: raw['languageTestType'] ?? raw['language_test_type'] ?? 'None',
      testScore: raw['languageScore'] ?? raw['language_score'],
      researchArea: raw['researchArea'] ?? raw['research_area'],
      proposedResearchTopic: raw['proposedResearchTopic'] ?? raw['proposed_research_topic'],
      preferredDegreeLevel: _parseStringList(raw['preferredDegreeLevel'] ?? raw['preferred_degree_level']),
      preferredFundingType: _parseStringList(raw['fundingRequirement'] ?? raw['funding_requirement']),
      preferredCountries: _parseStringList(raw['preferredCountries'] ?? raw['preferred_countries']),
      preferredUniversities: _parseStringList(raw['preferredUniversities'] ?? raw['preferred_universities']),
      studyMode: raw['studyMode'] ?? raw['study_mode'],
      workExperience: _parseWorkExperience(raw['workExperience'] ?? raw['work_experience']),
      familyIncomeRange: raw['familyIncomeRange'] ?? raw['family_income_range'],
      needsFinancialSupport: raw['needsFinancialSupport'] == true || raw['needs_financial_support'] == true,
      emailNotif: emailNotif,
      inSystemNotif: inSystemNotif,
      cvPath: raw['cvUrl'] ?? raw['cv_url'],
      transcriptPath: raw['transcriptUrl'] ?? raw['transcript_url'],
      certificatePath: raw['certificateUrl'] ?? raw['degreeCertificateUrl'] ?? raw['certificate_url'],
    );
  }

  void updateField(StudentProfileModel Function(StudentProfileModel) update) {
    state = update(state);
  }

  void togglePreferredCountry(String country) {
    final current = List<String>.from(state.preferredCountries);
    if (current.contains(country)) {
      current.remove(country);
    } else {
      current.add(country);
    }
    state = state.copyWith(preferredCountries: current);
  }

  void togglePreferredDegree(String degree) {
    final current = List<String>.from(state.preferredDegreeLevel);
    if (current.contains(degree)) {
      current.remove(degree);
    } else {
      current.add(degree);
    }
    state = state.copyWith(preferredDegreeLevel: current);
  }

  void addWorkExperience(Map<String, String> exp) {
    final current = List<Map<String, String>>.from(state.workExperience);
    current.add(exp);
    state = state.copyWith(workExperience: current);
  }

  void removeWorkExperience(int index) {
    final current = List<Map<String, String>>.from(state.workExperience);
    current.removeAt(index);
    state = state.copyWith(workExperience: current);
  }

  Future<void> submit() async {
    final data = state.toMap();
    await ref.read(authProvider.notifier).completeOnboarding(data);
  }
}

final onboardingProvider = NotifierProvider<OnboardingNotifier, StudentProfileModel>(
  OnboardingNotifier.new,
);







