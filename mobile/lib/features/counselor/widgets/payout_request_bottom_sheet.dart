import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:mobile/features/counselor/providers/counselor_providers.dart';

class PayoutRequestBottomSheet extends ConsumerStatefulWidget {
  const PayoutRequestBottomSheet({super.key});

  @override
  ConsumerState<PayoutRequestBottomSheet> createState() => _PayoutRequestBottomSheetState();
}

class _PayoutRequestBottomSheetState extends ConsumerState<PayoutRequestBottomSheet> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _accountNumberController = TextEditingController();
  final _accountNameController = TextEditingController();
  String? _selectedBankCode;
  bool _isLoading = false;

  @override
  void dispose() {
    _amountController.dispose();
    _accountNumberController.dispose();
    _accountNameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final banksAsync = ref.watch(counselorBanksProvider);
    final profile = ref.watch(counselorProfileProvider).valueOrNull;
    final availableBalance = profile?.pendingBalance ?? 0;

    return Container(
      padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      decoration: BoxDecoration(
        color: DesignSystem.overlayBackground(context),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Request Payout', style: GoogleFonts.plusJakartaSans(fontSize: 20, fontWeight: FontWeight.w800, color: DesignSystem.mainText(context))),
                IconButton(icon: const Icon(LucideIcons.x), onPressed: () => Navigator.pop(context)),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Available for withdrawal: ${availableBalance.toStringAsFixed(2)} ETB',
              style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 13, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 24),

            // Amount Input
            _buildFieldLabel('Amount to Withdraw (ETB)'),
            const SizedBox(height: 8),
            _buildTextField(
              controller: _amountController,
              hint: '0.00',
              icon: LucideIcons.coins,
              keyboardType: TextInputType.number,
              validator: (v) {
                if (v == null || v.isEmpty) return 'Enter amount';
                final amt = double.tryParse(v);
                if (amt == null || amt <= 0) return 'Invalid amount';
                if (amt > availableBalance) return 'Insufficient balance';
                return null;
              },
            ),
            const SizedBox(height: 20),

            // Bank Selection
            _buildFieldLabel('Select Bank'),
            const SizedBox(height: 8),
            banksAsync.when(
              data: (banks) => DropdownButtonFormField<String>(
                value: _selectedBankCode,
                items: banks.map((b) => DropdownMenuItem(
                  value: b['code']?.toString(),
                  child: Text(b['name']?.toString() ?? 'Unknown Bank', style: GoogleFonts.inter(color: DesignSystem.mainText(context), fontSize: 14)),
                )).toList(),
                onChanged: (v) => setState(() => _selectedBankCode = v),
                decoration: _dropdownDecoration(context),
                validator: (v) => v == null ? 'Select a bank' : null,
                dropdownColor: DesignSystem.overlayBackground(context),
                icon: Icon(LucideIcons.chevronDown, color: DesignSystem.labelText(context), size: 18),
              ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (_, __) => Text('Failed to load banks', style: TextStyle(color: Colors.red)),
            ),
            const SizedBox(height: 20),

            // Account Number
            _buildFieldLabel('Account Number'),
            const SizedBox(height: 8),
            _buildTextField(
              controller: _accountNumberController,
              hint: 'Enter account number',
              icon: LucideIcons.creditCard,
              keyboardType: TextInputType.number,
              validator: (v) => v == null || v.isEmpty ? 'Enter account number' : null,
            ),
            const SizedBox(height: 20),

            // Account Name
            _buildFieldLabel('Account Holder Name'),
            const SizedBox(height: 8),
            _buildTextField(
              controller: _accountNameController,
              hint: 'Enter name exactly as on bank account',
              icon: LucideIcons.user,
              validator: (v) => v == null || v.isEmpty ? 'Enter account name' : null,
            ),
            const SizedBox(height: 32),

            PrimaryButton(
              text: _isLoading ? 'Processing…' : 'Submit Request',
              onPressed: _isLoading ? null : _submit,
              isLoading: _isLoading,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFieldLabel(String label) {
    return Text(label, style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 12, fontWeight: FontWeight.w700));
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return GlassContainer(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      borderRadius: 16,
      child: TextFormField(
        controller: controller,
        keyboardType: keyboardType,
        validator: validator,
        style: GoogleFonts.inter(color: DesignSystem.mainText(context), fontSize: 14),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 14),
          icon: Icon(icon, color: DesignSystem.labelText(context), size: 18),
          border: InputBorder.none,
          errorStyle: const TextStyle(height: 0),
        ),
      ),
    );
  }

  InputDecoration _dropdownDecoration(BuildContext context) {
    return InputDecoration(
      filled: true,
      fillColor: DesignSystem.surface(context),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: DesignSystem.glassBorder(context)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: DesignSystem.glassBorder(context)),
      ),
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final banks = ref.read(counselorBanksProvider).valueOrNull ?? [];
    final selectedBank = banks.firstWhere(
      (b) => b['code']?.toString() == _selectedBankCode,
      orElse: () => <String, dynamic>{},
    );
    final bankName = selectedBank['name']?.toString();

    try {
      final ok = await ref.read(counselorAppServiceProvider).requestPayout(
        amount: double.parse(_amountController.text),
        bankCode: _selectedBankCode!,
        accountNumber: _accountNumberController.text,
        accountName: _accountNameController.text,
        bankName: bankName,
      );

      if (mounted) {
        if (ok) {
          ref.invalidate(counselorProfileProvider);
          ref.invalidate(counselorPayoutsProvider);
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Payout request submitted successfully!')));
        } else {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to submit payout request.')));
        }
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}
