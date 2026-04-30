import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/core/widgets/primary_button.dart';
import 'package:mobile/features/mentors/models/booking_models.dart';
import 'package:mobile/features/mentors/providers/mentors_providers.dart';
import 'package:webview_flutter/webview_flutter.dart';

class BookingBottomSheet extends ConsumerStatefulWidget {
  final int counselorId;
  final String counselorName;

  const BookingBottomSheet({
    super.key,
    required this.counselorId,
    required this.counselorName,
  });

  @override
  ConsumerState<BookingBottomSheet> createState() => _BookingBottomSheetState();
}

class _BookingBottomSheetState extends ConsumerState<BookingBottomSheet> {
  AvailabilitySlot? _selectedSlot;
  bool _isBooking = false;

  void _confirmBooking() async {
    if (_selectedSlot == null) return;
    setState(() => _isBooking = true);

    final result = await ref.read(counselorServiceProvider).createBooking(
      widget.counselorId,
      _selectedSlot!.id,
    );

    if (!mounted) return;
    setState(() => _isBooking = false);

    if (result == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to create booking. Please try again.')),
      );
      return;
    }

    final checkoutUrl = result['checkoutUrl'] as String?;
    if (checkoutUrl == null || checkoutUrl.isEmpty) {
      // No payment needed — booking confirmed directly
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Booking confirmed for ${DateFormat('MMM d, jm').format(_selectedSlot!.startTime)}')),
      );
      return;
    }

    // Open Chapa in-app WebView so we can intercept the deep-link redirect
    if (!mounted) return;
    Navigator.pop(context); // close bottom sheet
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => _ChapaPaymentScreen(checkoutUrl: checkoutUrl),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final slotsAsync = ref.watch(availableSlotsProvider(widget.counselorId));

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: DesignSystem.themeBackground(context),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Book a Session',
                  style: GoogleFonts.plusJakartaSans(
                      fontSize: 20, fontWeight: FontWeight.bold, color: DesignSystem.mainText(context))),
              IconButton(icon: const Icon(LucideIcons.x), onPressed: () => Navigator.pop(context)),
            ],
          ),
          Text('Select an available slot with ${widget.counselorName}',
              style: GoogleFonts.inter(fontSize: 14, color: DesignSystem.labelText(context))),
          const SizedBox(height: 24),
          ConstrainedBox(
            constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.4),
            child: slotsAsync.when(
              data: (slots) {
                if (slots.isEmpty) {
                  return Center(
                    child: Text('No available slots found.',
                        style: TextStyle(color: DesignSystem.labelText(context))),
                  );
                }
                return ListView.builder(
                  shrinkWrap: true,
                  itemCount: slots.length,
                  itemBuilder: (context, index) {
                    final slot = slots[index];
                    final isSelected = _selectedSlot?.id == slot.id;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedSlot = slot),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? DesignSystem.primary(context).withValues(alpha: 0.1)
                              : DesignSystem.surface(context),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSelected
                                ? DesignSystem.primary(context)
                                : DesignSystem.glassBorder(context),
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(LucideIcons.calendar,
                                color: isSelected
                                    ? DesignSystem.primary(context)
                                    : DesignSystem.labelText(context),
                                size: 20),
                            const SizedBox(width: 16),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(DateFormat('EEEE, MMM d').format(slot.startTime),
                                    style: GoogleFonts.inter(
                                        fontWeight: FontWeight.bold,
                                        color: DesignSystem.mainText(context))),
                                Text(DateFormat('jm').format(slot.startTime),
                                    style: GoogleFonts.inter(
                                        fontSize: 12, color: DesignSystem.labelText(context))),
                              ],
                            ),
                            const Spacer(),
                            if (isSelected)
                              Icon(LucideIcons.checkCircle,
                                  color: DesignSystem.primary(context), size: 20),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) =>
                  Center(child: Text('Error loading slots', style: TextStyle(color: Colors.red))),
            ),
          ),
          const SizedBox(height: 24),
          PrimaryButton(
            onPressed: _selectedSlot != null && !_isBooking ? _confirmBooking : null,
            text: _isBooking ? 'Confirming...' : 'Confirm & Pay',
            isLoading: _isBooking,
          ),
          SizedBox(height: MediaQuery.of(context).padding.bottom),
        ],
      ),
    );
  }
}

/// In-app Chapa payment screen using WebView.
/// Intercepts the deep-link redirect (edupath://payment/success) to detect completion.
class _ChapaPaymentScreen extends StatefulWidget {
  final String checkoutUrl;
  const _ChapaPaymentScreen({required this.checkoutUrl});

  @override
  State<_ChapaPaymentScreen> createState() => _ChapaPaymentScreenState();
}

class _ChapaPaymentScreenState extends State<_ChapaPaymentScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;

  static const String _deepLinkScheme = 'edupath://payment/success';

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(NavigationDelegate(
        onPageStarted: (_) => setState(() => _isLoading = true),
        onPageFinished: (_) => setState(() => _isLoading = false),
        onNavigationRequest: (request) {
          final url = request.url;
          // Intercept our deep link — Chapa redirected back after payment
          if (url.startsWith('edupath://')) {
            _handlePaymentReturn(url);
            return NavigationDecision.prevent;
          }
          return NavigationDecision.navigate;
        },
        onWebResourceError: (error) {
          // Ignore SSL/redirect errors that are normal during Chapa flow
        },
      ))
      ..loadRequest(Uri.parse(widget.checkoutUrl));
  }

  void _handlePaymentReturn(String url) {
    final uri = Uri.tryParse(url.replaceFirst('edupath://', 'https://'));
    final txRef = uri?.queryParameters['tx_ref'];
    final bookingId = uri?.queryParameters['bookingId'];

    Navigator.pop(context); // close WebView

    // Show result screen
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => _PaymentResultScreen(txRef: txRef, bookingId: bookingId),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Secure Payment'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () {
            showDialog(
              context: context,
              builder: (_) => AlertDialog(
                title: const Text('Cancel Payment?'),
                content: const Text('Are you sure you want to cancel the payment?'),
                actions: [
                  TextButton(onPressed: () => Navigator.pop(context), child: const Text('No')),
                  TextButton(
                    onPressed: () {
                      Navigator.pop(context); // close dialog
                      Navigator.pop(context); // close WebView
                    },
                    child: const Text('Yes, Cancel'),
                  ),
                ],
              ),
            );
          },
        ),
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }
}

/// Shows payment success/failure after Chapa redirects back.
class _PaymentResultScreen extends StatelessWidget {
  final String? txRef;
  final String? bookingId;

  const _PaymentResultScreen({this.txRef, this.bookingId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DesignSystem.themeBackground(context),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_circle_rounded,
                    color: Color(0xFF10B981), size: 48),
              ),
              const SizedBox(height: 24),
              Text('Payment Submitted!',
                  style: GoogleFonts.plusJakartaSans(
                      color: DesignSystem.mainText(context),
                      fontSize: 24,
                      fontWeight: FontWeight.w800)),
              const SizedBox(height: 12),
              Text(
                'Your payment is being verified. Your session will be confirmed shortly.',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                    color: DesignSystem.labelText(context), fontSize: 15, height: 1.5),
              ),
              if (txRef != null) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: DesignSystem.surface(context),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    'Ref: $txRef',
                    style: GoogleFonts.inter(
                        color: DesignSystem.labelText(context),
                        fontSize: 11),
                  ),
                ),
              ],
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    // Pop back to the mentors/bookings screen
                    Navigator.of(context).popUntil((route) => route.isFirst);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: DesignSystem.primary(context),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: Text('View My Bookings',
                      style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 16)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
