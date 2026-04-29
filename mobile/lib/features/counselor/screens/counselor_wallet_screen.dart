import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/counselor/providers/counselor_providers.dart';
import 'package:mobile/features/counselor/models/counselor_models.dart';
import 'package:mobile/features/counselor/widgets/payout_request_bottom_sheet.dart';

class CounselorWalletScreen extends ConsumerStatefulWidget {
  const CounselorWalletScreen({super.key});

  @override
  ConsumerState<CounselorWalletScreen> createState() => _CounselorWalletScreenState();
}

class _CounselorWalletScreenState extends ConsumerState<CounselorWalletScreen> {
  @override
  Widget build(BuildContext context) {
    final profileAsync = ref.watch(counselorProfileProvider);
    final ledgerAsync = ref.watch(walletLedgerProvider);
    final payoutsAsync = ref.watch(counselorPayoutsProvider);

    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(context),
            const SizedBox(height: 16),
            Expanded(
              child: RefreshIndicator(
                onRefresh: () async {
                  ref.invalidate(counselorProfileProvider);
                  ref.invalidate(walletLedgerProvider);
                  ref.invalidate(counselorPayoutsProvider);
                },
                color: DesignSystem.primary(context),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildBalanceCard(context, profileAsync),
                      const SizedBox(height: 24),
                      _buildSectionHeader('Recent Transactions', LucideIcons.list),
                      const SizedBox(height: 12),
                      _buildLedger(context, ledgerAsync),
                      const SizedBox(height: 24),
                      _buildSectionHeader('Payout History', LucideIcons.history),
                      const SizedBox(height: 12),
                      _buildPayoutHistory(context, payoutsAsync),
                      const SizedBox(height: 80),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Wallet & Earnings', style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 24, fontWeight: FontWeight.w800)),
                Text('Manage your finances', style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 13)),
              ],
            ),
          ),
          Icon(LucideIcons.wallet, color: DesignSystem.primary(context), size: 24),
        ],
      ),
    );
  }

  Widget _buildBalanceCard(BuildContext context, AsyncValue<CounselorProfile?> profileAsync) {
    final profile = profileAsync.valueOrNull;
    final primary = DesignSystem.primary(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [primary, primary.withValues(alpha: 0.8), const Color(0xFF06B6D4)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: primary.withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('AVAILABLE BALANCE', style: GoogleFonts.inter(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1.5)),
              const Icon(LucideIcons.coins, color: Colors.white70, size: 20),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${NumberFormat('#,##0').format(profile?.pendingBalance ?? 0)} ETB',
            style: GoogleFonts.plusJakartaSans(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('TOTAL EARNED', style: GoogleFonts.inter(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.w700)),
                    Text('${NumberFormat('#,##0').format(profile?.totalEarned ?? 0)} ETB', style: GoogleFonts.plusJakartaSans(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
              GestureDetector(
                onTap: () => _openPayoutRequest(context),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    'Withdraw',
                    style: GoogleFonts.inter(color: primary, fontWeight: FontWeight.w800, fontSize: 13),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: DesignSystem.primary(context), size: 18),
        const SizedBox(width: 8),
        Text(title, style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 16, fontWeight: FontWeight.w800)),
      ],
    );
  }

  Widget _buildLedger(BuildContext context, AsyncValue<List<WalletTransaction>> ledgerAsync) {
    return ledgerAsync.when(
      data: (transactions) {
        if (transactions.isEmpty) return _buildEmpty(context, 'No transactions found');
        return Column(
          children: transactions.map((t) => _buildTransactionCard(context, t)).toList(),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Text('Error loading transactions'),
    );
  }

  Widget _buildTransactionCard(BuildContext context, WalletTransaction t) {
    final isCredit = t.type == 'credit';
    final color = isCredit ? const Color(0xFF10B981) : Colors.red;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GlassContainer(
        padding: const EdgeInsets.all(16),
        borderRadius: 20,
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: color.withValues(alpha: 0.1), shape: BoxShape.circle),
              child: Icon(isCredit ? LucideIcons.arrowDownLeft : LucideIcons.arrowUpRight, color: color, size: 18),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(t.description, style: GoogleFonts.inter(color: DesignSystem.mainText(context), fontSize: 14, fontWeight: FontWeight.w600)),
                  Text(DateFormat('MMM d, yyyy').format(t.createdAt), style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 12)),
                ],
              ),
            ),
            Text(
              '${isCredit ? '+' : '-'}${NumberFormat('#,##0').format(t.amount)} ETB',
              style: GoogleFonts.plusJakartaSans(color: color, fontSize: 15, fontWeight: FontWeight.w800),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPayoutHistory(BuildContext context, AsyncValue<List<CounselorPayout>> payoutsAsync) {
    return payoutsAsync.when(
      data: (payouts) {
        if (payouts.isEmpty) return _buildEmpty(context, 'No payout history');
        return Column(
          children: payouts.map((p) => _buildPayoutCard(context, p)).toList(),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Text('Error loading payouts'),
    );
  }

  Widget _buildPayoutCard(BuildContext context, CounselorPayout p) {
    Color statusColor;
    switch (p.status) {
      case 'completed': statusColor = const Color(0xFF10B981); break;
      case 'pending': statusColor = const Color(0xFFF59E0B); break;
      default: statusColor = Colors.red;
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GlassContainer(
        padding: const EdgeInsets.all(16),
        borderRadius: 20,
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${NumberFormat('#,##0').format(p.amount)} ETB', style: GoogleFonts.plusJakartaSans(color: DesignSystem.mainText(context), fontSize: 16, fontWeight: FontWeight.w800)),
                  Text('${p.bankName ?? 'Bank'} • ${p.accountNumber ?? '****'}', style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 12)),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                  child: Text(p.status.toUpperCase(), style: GoogleFonts.inter(color: statusColor, fontSize: 10, fontWeight: FontWeight.w800)),
                ),
                const SizedBox(height: 4),
                Text(DateFormat('MMM d').format(p.createdAt), style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 11)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmpty(BuildContext context, String msg) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          children: [
            Icon(LucideIcons.ghost, color: DesignSystem.labelText(context).withValues(alpha: 0.3), size: 40),
            const SizedBox(height: 8),
            Text(msg, style: GoogleFonts.inter(color: DesignSystem.labelText(context), fontSize: 14)),
          ],
        ),
      ),
    );
  }

  void _openPayoutRequest(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const PayoutRequestBottomSheet(),
    );
  }
}
