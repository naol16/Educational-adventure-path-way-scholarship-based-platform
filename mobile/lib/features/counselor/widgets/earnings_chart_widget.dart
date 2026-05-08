import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:mobile/features/core/theme/design_system.dart';
import 'package:mobile/features/core/widgets/glass_container.dart';
import 'package:mobile/features/counselor/models/counselor_models.dart';

class EarningsChartWidget extends StatelessWidget {
  final List<WalletTransaction> transactions;

  const EarningsChartWidget({super.key, required this.transactions});

  @override
  Widget build(BuildContext context) {
    final chartData = _processData();
    if (chartData.isEmpty) return const SizedBox.shrink();

    final primary = DesignSystem.primary(context);

    return GlassContainer(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 16),
      borderRadius: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Revenue Growth',
                    style: GoogleFonts.plusJakartaSans(
                      color: DesignSystem.mainText(context),
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  Text(
                    'Monthly earnings trend',
                    style: GoogleFonts.inter(
                      color: DesignSystem.labelText(context),
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  'Last 6 Months',
                  style: GoogleFonts.inter(
                    color: primary,
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 32),
          SizedBox(
            height: 180,
            child: LineChart(
              LineChartData(
                gridData: const FlGridData(show: false),
                titlesData: FlTitlesData(
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        final index = value.toInt();
                        if (index < 0 || index >= chartData.length) return const SizedBox.shrink();
                        return Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Text(
                            chartData[index].label,
                            style: GoogleFonts.inter(
                              color: DesignSystem.labelText(context),
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        );
                      },
                      reservedSize: 30,
                    ),
                  ),
                  leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                borderData: FlBorderData(show: false),
                lineBarsData: [
                  LineChartBarData(
                    spots: chartData.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value.amount)).toList(),
                    isCurved: true,
                    color: primary,
                    barWidth: 4,
                    isStrokeCapRound: true,
                    dotData: FlDotData(
                      show: true,
                      getDotPainter: (spot, percent, barData, index) => FlDotCirclePainter(
                        radius: 4,
                        color: Colors.white,
                        strokeWidth: 2,
                        strokeColor: primary,
                      ),
                    ),
                    belowBarData: BarAreaData(
                      show: true,
                      gradient: LinearGradient(
                        colors: [
                          primary.withValues(alpha: 0.3),
                          primary.withValues(alpha: 0.0),
                        ],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                ],
                lineTouchData: LineTouchData(
                  touchTooltipData: LineTouchTooltipData(
                    getTooltipColor: (touchedSpot) => DesignSystem.overlayBackground(context),
                    getTooltipItems: (List<LineBarSpot> touchedSpots) {
                      return touchedSpots.map((LineBarSpot touchedSpot) {
                        return LineTooltipItem(
                          '${NumberFormat('#,##0').format(touchedSpot.y)} ETB',
                          GoogleFonts.inter(
                            color: DesignSystem.mainText(context),
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        );
                      }).toList();
                    },
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  List<_ChartPoint> _processData() {
    if (transactions.isEmpty) return [];

    final Map<String, double> monthlySums = {};
    final now = DateTime.now();
    
    // Initialize last 6 months
    for (int i = 5; i >= 0; i--) {
      final date = DateTime(now.year, now.month - i, 1);
      final key = DateFormat('MMM').format(date);
      monthlySums[key] = 0.0;
    }

    for (final tx in transactions) {
      if (tx.type == 'credit') {
        final key = DateFormat('MMM').format(tx.createdAt);
        if (monthlySums.containsKey(key)) {
          monthlySums[key] = monthlySums[key]! + tx.amount;
        }
      }
    }

    return monthlySums.entries.map((e) => _ChartPoint(e.key, e.value)).toList();
  }
}

class _ChartPoint {
  final String label;
  final double amount;
  _ChartPoint(this.label, this.amount);
}
