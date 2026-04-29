import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:mobile/features/counselor/providers/counselor_providers.dart';
import 'package:mobile/features/counselor/models/counselor_models.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:go_router/go_router.dart';

class CounselorOnboardingScreen extends ConsumerStatefulWidget {
  const CounselorOnboardingScreen({super.key});

  @override
  ConsumerState<CounselorOnboardingScreen> createState() => _CounselorOnboardingScreenState();
}

class _CounselorOnboardingScreenState extends ConsumerState<CounselorOnboardingScreen> {
  int _currentStep = 1;
  bool _isSaving = false;

  // Step 1: Identity
  final _bioController = TextEditingController();
  final _phoneController = TextEditingController();
  String? _country;
  String? _city;
  final _languagesController = TextEditingController();

  // Step 2: Professional
  String? _educationLevel;
  final _universityController = TextEditingController();
  final _studyCountryController = TextEditingController();
  String? _position;
  final _orgController = TextEditingController();
  final _expController = TextEditingController();
  List<String> _selectedExpertise = [];

  // Step 3: Availability
  double _hourlyRate = 50.0;
  int _sessionDuration = 60;
  List<String> _consultationModes = ['chat', 'video'];
  List<Map<String, String>> _slots = [];

  // Step 4: Documents
  File? _profileImage;
  File? _cvFile;
  File? _certFile;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    final profile = await ref.read(counselorAppServiceProvider).getMyProfile();
    if (profile != null && mounted) {
      setState(() {
        _bioController.text = profile.bio;
        _phoneController.text = profile.phoneNumber ?? '';
        _country = profile.countryOfResidence;
        _city = profile.city;
        _languagesController.text = profile.languages.join(', ');
        _educationLevel = profile.highestEducationLevel;
        _universityController.text = profile.universityName ?? '';
        _studyCountryController.text = profile.studyCountry ?? '';
        _position = profile.currentPosition;
        _orgController.text = profile.organization ?? '';
        _expController.text = profile.yearsOfExperience.toString();
        _selectedExpertise = profile.areasOfExpertise;
        _hourlyRate = profile.hourlyRate;
        _sessionDuration = profile.sessionDuration;
        _consultationModes = profile.consultationModes;
      });
    }
  }

  @override
  void dispose() {
    _bioController.dispose();
    _phoneController.dispose();
    _languagesController.dispose();
    _universityController.dispose();
    _studyCountryController.dispose();
    _orgController.dispose();
    _expController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: SafeArea(
        child: Column(
          children: [
            _buildStepper(),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: _buildCurrentStep(),
              ),
            ),
            _buildNavButtons(),
          ],
        ),
      ),
    );
  }

  Widget _buildStepper() {
    final steps = [
      {'id': 1, 'icon': LucideIcons.user, 'title': 'Identity'},
      {'id': 2, 'icon': LucideIcons.briefcase, 'title': 'Professional'},
      {'id': 3, 'icon': LucideIcons.clock, 'title': 'Availability'},
      {'id': 4, 'icon': LucideIcons.shieldCheck, 'title': 'Documents'},
    ];

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 24),
      decoration: BoxDecoration(
        color: DesignSystem.surface(context),
        border: Border(bottom: BorderSide(color: DesignSystem.glassBorder(context))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: steps.map((s) {
          final id = s['id'] as int;
          final active = _currentStep == id;
          final done = _currentStep > id;
          final color = active ? DesignSystem.primary(context) : (done ? const Color(0xFF10B981) : DesignSystem.labelText(context));

          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: color.withValues(alpha: active ? 0.5 : 0.2)),
                ),
                child: Icon(done ? LucideIcons.check : s['icon'] as IconData, color: color, size: 20),
              ),
              const SizedBox(height: 4),
              Text(s['title'] as String, style: GoogleFonts.inter(color: color, fontSize: 10, fontWeight: FontWeight.w700)),
            ],
          );
        }).toList(),
      ),
    );
  }

  Widget _buildCurrentStep() {
    switch (_currentStep) {
      case 1: return _buildStep1();
      case 2: return _buildStep2();
      case 3: return _buildStep3();
      case 4: return _buildStep4();
      default: return const SizedBox.shrink();
    }
  }

  Widget _buildStep1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle('Identity & Bio', LucideIcons.user),
        const SizedBox(height: 24),
        _buildLabel('Professional Bio'),
        _buildTextArea(_bioController, 'Tell students about your expertise...', minLines: 5),
        const SizedBox(height: 20),
        _buildLabel('Phone Number'),
        _buildTextField(_phoneController, '+251...', icon: LucideIcons.phone),
        const SizedBox(height: 20),
        Row(
          children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_buildLabel('Country'), _buildTextField(null, 'Ethiopia', icon: LucideIcons.globe, value: _country, onChanged: (v) => setState(() => _country = v))])),
            const SizedBox(width: 16),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [_buildLabel('City'), _buildTextField(null, 'Addis Ababa', icon: LucideIcons.mapPin, value: _city, onChanged: (v) => setState(() => _city = v))])),
          ],
        ),
        const SizedBox(height: 20),
        _buildLabel('Languages'),
        _buildTextField(_languagesController, 'English, Amharic...', icon: LucideIcons.languages),
      ],
    );
  }

  Widget _buildStep2() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle('Professional Background', LucideIcons.briefcase),
        const SizedBox(height: 24),
        _buildLabel('Highest Education Level'),
        _buildDropdown(['Bachelors', 'Masters', 'PhD'], _educationLevel, (v) => setState(() => _educationLevel = v)),
        const SizedBox(height: 20),
        _buildLabel('University Name'),
        _buildTextField(_universityController, 'Harvard University...', icon: LucideIcons.graduationCap),
        const SizedBox(height: 20),
        _buildLabel('Current Position'),
        _buildDropdown(['Higher Education Consultant', 'Scholarship Specialist', 'Career Coach', 'Admissions Officer'], _position, (v) => setState(() => _position = v)),
        const SizedBox(height: 20),
        _buildLabel('Years of Experience'),
        _buildTextField(_expController, '5', icon: LucideIcons.activity, keyboardType: TextInputType.number),
      ],
    );
  }

  Widget _buildStep3() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle('Availability & Pricing', LucideIcons.clock),
        const SizedBox(height: 24),
        _buildLabel('Hourly Rate (ETB)'),
        Slider(
          value: _hourlyRate,
          min: 0,
          max: 5000,
          divisions: 100,
          label: '${_hourlyRate.toInt()} ETB',
          activeColor: DesignSystem.primary(context),
          onChanged: (v) => setState(() => _hourlyRate = v),
        ),
        Center(child: Text('${_hourlyRate.toInt()} ETB / hour', style: GoogleFonts.plusJakartaSans(fontSize: 18, fontWeight: FontWeight.w800, color: DesignSystem.primary(context)))),
        const SizedBox(height: 32),
        _buildLabel('Consultation Modes'),
        Wrap(
          spacing: 10,
          children: ['chat', 'audio', 'video'].map((m) {
            final active = _consultationModes.contains(m);
            return FilterChip(
              label: Text(m.toUpperCase()),
              selected: active,
              onSelected: (s) {
                setState(() {
                  if (s) _consultationModes.add(m);
                  else _consultationModes.remove(m);
                });
              },
              selectedColor: DesignSystem.primary(context).withValues(alpha: 0.2),
              checkmarkColor: DesignSystem.primary(context),
            );
          }).toList(),
        ),
        const SizedBox(height: 32),
        _buildLabel('Default Session Duration'),
        Row(
          children: [30, 60, 90].map((d) {
            final active = _sessionDuration == d;
            return Expanded(
              child: GestureDetector(
                onTap: () => setState(() => _sessionDuration = d),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    color: active ? DesignSystem.primary(context) : DesignSystem.surface(context),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(child: Text('$d min', style: GoogleFonts.inter(color: active ? Colors.white : DesignSystem.mainText(context), fontWeight: FontWeight.w700))),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildStep4() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle('Verification Documents', LucideIcons.shieldCheck),
        const SizedBox(height: 24),
        _buildFilePicker('Profile Photo', _profileImage, () => _pickImage(), isImage: true),
        const SizedBox(height: 20),
        _buildFilePicker('Curriculum Vitae (CV)', _cvFile, () => _pickFile('cv')),
        const SizedBox(height: 20),
        _buildFilePicker('Academic Certificates', _certFile, () => _pickFile('cert')),
      ],
    );
  }

  Widget _buildSectionTitle(String title, IconData icon) {
    return Row(
      children: [
        Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: DesignSystem.primary(context).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)), child: Icon(icon, color: DesignSystem.primary(context), size: 20)),
        const SizedBox(width: 12),
        Text(title, style: GoogleFonts.plusJakartaSans(fontSize: 20, fontWeight: FontWeight.w800, color: DesignSystem.mainText(context))),
      ],
    );
  }

  Widget _buildLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, left: 4),
      child: Text(label, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: DesignSystem.labelText(context))),
    );
  }

  Widget _buildTextField(TextEditingController? controller, String hint, {IconData? icon, String? value, ValueChanged<String>? onChanged, TextInputType? keyboardType}) {
    return GlassContainer(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      borderRadius: 16,
      child: TextFormField(
        controller: controller,
        initialValue: controller == null ? value : null,
        onChanged: onChanged,
        keyboardType: keyboardType,
        style: GoogleFonts.inter(color: DesignSystem.mainText(context), fontSize: 14),
        decoration: InputDecoration(hintText: hint, hintStyle: GoogleFonts.inter(color: DesignSystem.labelText(context)), icon: icon != null ? Icon(icon, size: 18, color: DesignSystem.labelText(context)) : null, border: InputBorder.none),
      ),
    );
  }

  Widget _buildTextArea(TextEditingController controller, String hint, {int minLines = 3}) {
    return GlassContainer(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      borderRadius: 16,
      child: TextFormField(
        controller: controller,
        maxLines: null,
        minLines: minLines,
        style: GoogleFonts.inter(color: DesignSystem.mainText(context), fontSize: 14, height: 1.5),
        decoration: InputDecoration(hintText: hint, hintStyle: GoogleFonts.inter(color: DesignSystem.labelText(context)), border: InputBorder.none),
      ),
    );
  }

  Widget _buildDropdown(List<String> items, String? value, ValueChanged<String?> onChanged) {
    return GlassContainer(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      borderRadius: 16,
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          isExpanded: true,
          hint: Text('Select...', style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 14)),
          items: items.map((i) => DropdownMenuItem(value: i, child: Text(i, style: GoogleFonts.inter(color: DesignSystem.mainText(context), fontSize: 14)))).toList(),
          onChanged: onChanged,
          dropdownColor: DesignSystem.overlayBackground(context),
        ),
      ),
    );
  }

  Widget _buildFilePicker(String label, File? file, VoidCallback onTap, {bool isImage = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildLabel(label),
        GestureDetector(
          onTap: onTap,
          child: GlassContainer(
            padding: const EdgeInsets.all(20),
            borderRadius: 20,
            child: Row(
              children: [
                if (isImage && file != null) ClipRRect(borderRadius: BorderRadius.circular(10), child: Image.file(file, width: 50, height: 50, fit: BoxFit.cover))
                else Icon(isImage ? LucideIcons.image : LucideIcons.fileText, color: file != null ? const Color(0xFF10B981) : DesignSystem.primary(context), size: 32),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(file != null ? 'File selected' : 'Upload file', style: GoogleFonts.inter(color: DesignSystem.mainText(context), fontWeight: FontWeight.w700, fontSize: 14)),
                      Text(file != null ? file.path.split('/').last : 'PDF, JPG or PNG (max 5MB)', style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 11)),
                    ],
                  ),
                ),
                if (file != null) const Icon(LucideIcons.checkCircle, color: Color(0xFF10B981), size: 20),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final img = await picker.pickImage(source: ImageSource.gallery);
    if (img != null) setState(() => _profileImage = File(img.path));
  }

  Future<void> _pickFile(String type) async {
    final res = await FilePicker.platform.pickFiles(type: FileType.custom, allowedExtensions: ['pdf', 'doc', 'docx']);
    if (res != null) {
      setState(() {
        if (type == 'cv') _cvFile = File(res.files.single.path!);
        else _certFile = File(res.files.single.path!);
      });
    }
  }

  Widget _buildNavButtons() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: DesignSystem.surface(context), border: Border(top: BorderSide(color: DesignSystem.glassBorder(context)))),
      child: Row(
        children: [
          if (_currentStep > 1) Expanded(child: PrimaryButton(text: 'Previous', isOutlined: true, onPressed: () => setState(() => _currentStep--)))
          else const Spacer(),
          const SizedBox(width: 16),
          Expanded(
            child: PrimaryButton(
              text: _currentStep == 4 ? 'Finish' : 'Next',
              isLoading: _isSaving,
              onPressed: _currentStep == 4 ? _finish : () => setState(() => _currentStep++),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _finish() async {
    setState(() => _isSaving = true);
    try {
      final payload = {
        'bio': _bioController.text,
        'phoneNumber': _phoneController.text,
        'countryOfResidence': _country,
        'city': _city,
        'languages': _languagesController.text.split(',').map((e) => e.trim()).toList(),
        'highestEducationLevel': _educationLevel,
        'universityName': _universityController.text,
        'studyCountry': _studyCountryController.text,
        'currentPosition': _position,
        'organization': _orgController.text,
        'yearsOfExperience': int.tryParse(_expController.text) ?? 0,
        'hourlyRate': _hourlyRate,
        'sessionDuration': _sessionDuration,
        'consultationModes': _consultationModes,
        'isOnboarded': true,
      };

      final ok = await ref.read(counselorAppServiceProvider).submitApplication(payload);
      if (ok) {
        await ref.read(authProvider.notifier).refreshProfile();
        if (mounted) context.go('/home');
      } else {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to save. Check fields.')));
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }
}
