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
  final _emailController = TextEditingController();
  final _swiftController = TextEditingController();
  
  String _selectedCurrency = 'ETB';
  String _selectedMethod = 'bank_transfer';
  String? _selectedBankCode;
  bool _isLoading = false;

  @override
  void dispose() {
    _amountController.dispose();
    _accountNumberController.dispose();
    _accountNameController.dispose();
    _emailController.dispose();
    _swiftController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final banksAsync = ref.watch(counselorBanksProvider);
    final profile = ref.watch(counselorProfileProvider).valueOrNull;
    final availableEtb = profile?.pendingBalance ?? 0;
    
    // We'll estimate the USD conversion for the label
    // In a real app, you might fetch the live rate from the backend here
    const estRate = 120.0; 
    final availableUsd = availableEtb / estRate;

    return Container(
      padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      decoration: BoxDecoration(
        color: DesignSystem.overlayBackground(context),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
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
              const SizedBox(height: 16),
              
              // Currency Selector
              _buildFieldLabel('Withdraw In'),
              const SizedBox(height: 12),
              Row(
                children: [
                  _buildCurrencyOption('ETB', LucideIcons.coins),
                  const SizedBox(width: 12),
                  _buildCurrencyOption('USD', LucideIcons.globe),
                ],
              ),
              const SizedBox(height: 20),

              Text(
                _selectedCurrency == 'ETB' 
                  ? 'Available: ${availableEtb.toStringAsFixed(2)} ETB'
                  : 'Approx. Available: \$${availableUsd.toStringAsFixed(2)} USD',
                style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 13, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 24),

              // Amount Input
              _buildFieldLabel('Amount ($_selectedCurrency)'),
              const SizedBox(height: 8),
              _buildTextField(
                controller: _amountController,
                hint: '0.00',
                icon: _selectedCurrency == 'ETB' ? LucideIcons.coins : LucideIcons.dollarSign,
                keyboardType: TextInputType.number,
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Enter amount';
                  final amt = double.tryParse(v);
                  if (amt == null || amt <= 0) return 'Invalid amount';
                  if (_selectedCurrency == 'ETB' && amt > availableEtb) return 'Insufficient balance';
                  if (_selectedCurrency == 'USD' && amt > availableUsd) return 'Insufficient balance';
                  return null;
                },
              ),
              const SizedBox(height: 20),

              if (_selectedCurrency == 'ETB') ...[
                // Bank Selection (ETB only)
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
                
                _buildFieldLabel('Account Number'),
                const SizedBox(height: 8),
                _buildTextField(
                  controller: _accountNumberController,
                  hint: 'Enter account number',
                  icon: LucideIcons.creditCard,
                  keyboardType: TextInputType.number,
                  validator: (v) => v == null || v.isEmpty ? 'Enter account number' : null,
                ),
              ] else ...[
                // USD Options
                _buildFieldLabel('Payout Method'),
                const SizedBox(height: 8),
                _buildMethodSelector(),
                const SizedBox(height: 20),

                if (_selectedMethod == 'paypal') ...[
                   _buildFieldLabel('PayPal Email'),
                   const SizedBox(height: 8),
                   _buildTextField(
                     controller: _emailController,
                     hint: 'yourname@example.com',
                     icon: LucideIcons.mail,
                     keyboardType: TextInputType.emailAddress,
                     validator: (v) => (v == null || !v.contains('@')) ? 'Enter valid email' : null,
                   ),
                ] else ...[
                   _buildFieldLabel('IBAN / Account Number'),
                   const SizedBox(height: 8),
                   _buildTextField(
                     controller: _accountNumberController,
                     hint: 'International Format',
                     icon: LucideIcons.globe,
                     validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                   ),
                   const SizedBox(height: 20),
                   _buildFieldLabel('SWIFT / BIC Code'),
                   const SizedBox(height: 8),
                   _buildTextField(
                     controller: _swiftController,
                     hint: 'BANKUS33',
                     icon: LucideIcons.shieldCheck,
                     validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                   ),
                ],
              ],

              const SizedBox(height: 20),
              _buildFieldLabel('Account Holder Name'),
              const SizedBox(height: 8),
              _buildTextField(
                controller: _accountNameController,
                hint: 'Full legal name',
                icon: LucideIcons.user,
                validator: (v) => v == null || v.isEmpty ? 'Enter account name' : null,
              ),
              
              const SizedBox(height: 32),

              PrimaryButton(
                text: _isLoading ? 'Processing…' : 'Confirm Withdrawal',
                onPressed: _isLoading ? null : _submit,
                isLoading: _isLoading,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCurrencyOption(String code, IconData icon) {
    final isSelected = _selectedCurrency == code;
    final color = isSelected ? DesignSystem.primary(context) : DesignSystem.labelText(context).withValues(alpha: 0.1);
    
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() {
          _selectedCurrency = code;
          if (code == 'USD') _selectedMethod = 'paypal';
          else _selectedMethod = 'bank_transfer';
        }),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: isSelected ? DesignSystem.primary(context).withValues(alpha: 0.1) : Colors.transparent,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: isSelected ? DesignSystem.primary(context) : DesignSystem.glassBorder(context), width: 2),
          ),
          child: Column(
            children: [
              Icon(icon, color: isSelected ? DesignSystem.primary(context) : DesignSystem.labelText(context), size: 20),
              const SizedBox(height: 4),
              Text(code, style: GoogleFonts.inter(color: isSelected ? DesignSystem.primary(context) : DesignSystem.labelText(context), fontWeight: FontWeight.w800, fontSize: 13)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMethodSelector() {
     return Row(
       children: [
         _buildSmallMethodTab('paypal', 'PayPal'),
         const SizedBox(width: 10),
         _buildSmallMethodTab('international_card', 'Global Bank'),
       ],
     );
  }

  Widget _buildSmallMethodTab(String key, String label) {
    final isSelected = _selectedMethod == key;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedMethod = key),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? DesignSystem.primary(context) : DesignSystem.surface(context),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Center(
            child: Text(label, style: GoogleFonts.inter(color: isSelected ? Colors.white : DesignSystem.labelText(context), fontSize: 12, fontWeight: FontWeight.bold)),
          ),
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
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: DesignSystem.glassBorder(context))),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: DesignSystem.glassBorder(context))),
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final details = <String, dynamic>{
      'accountHolderName': _accountNameController.text,
    };

    if (_selectedCurrency == 'ETB') {
      final banks = ref.read(counselorBanksProvider).valueOrNull ?? [];
      final selectedBank = banks.firstWhere((b) => b['code']?.toString() == _selectedBankCode, orElse: () => <String, dynamic>{});
      details['bankCode'] = _selectedBankCode;
      details['bankName'] = selectedBank['name']?.toString() ?? 'Bank';
      details['accountNumber'] = _accountNumberController.text;
    } else {
      if (_selectedMethod == 'paypal') {
        details['email'] = _emailController.text;
      } else {
        details['iban'] = _accountNumberController.text;
        details['swiftCode'] = _swiftController.text;
      }
    }

    try {
      final ok = await ref.read(counselorAppServiceProvider).requestPayout(
        amount: double.parse(_amountController.text),
        currency: _selectedCurrency,
        payoutMethod: _selectedMethod,
        payoutDetails: details,
      );

      if (mounted) {
        if (ok) {
          ref.invalidate(counselorProfileProvider);
          ref.invalidate(counselorPayoutsProvider);
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Withdrawal request submitted!')));
        } else {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to submit request.')));
        }
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}
