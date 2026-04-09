import 'package:flutter/material.dart';
import '../../../utils/app_colors.dart';

class ScholarshipDetailScreen extends StatelessWidget {
  const ScholarshipDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.bookmark_border),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.secondary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text('98% Match based on your profile', style: TextStyle(color: AppColors.secondary, fontWeight: FontWeight.bold, fontSize: 12)),
            ),
            const SizedBox(height: 16),
            const Text('Global Excellence Engineering Scholarship', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('University of Oxford • United Kingdom', style: TextStyle(color: AppColors.textLight, fontSize: 16)),
            const SizedBox(height: 24),
            Row(
              children: [
                _buildInfoItem(Icons.money, 'Fully Funded'),
                const SizedBox(width: 16),
                _buildInfoItem(Icons.school, 'Master\'s'),
                const SizedBox(width: 16),
                _buildInfoItem(Icons.event, 'Oct 15'),
              ],
            ),
            const Divider(height: 48),
            const Text('About the Scholarship', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            const Text(
              'This scholarship provides full funding for outstanding international applicants wishing to undertake a full-time Master\'s degree in Engineering. It covers course fees and a grant for living costs.',
              style: TextStyle(color: AppColors.textDark, height: 1.5),
            ),
            const SizedBox(height: 24),
            const Text('Eligibility', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _buildBulletPoint('Must have a GPA of 3.8 or equivalent'),
            _buildBulletPoint('IELTS score of 7.0 or better'),
            _buildBulletPoint('Demonstrated leadership potential'),
            const SizedBox(height: 48),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                   backgroundColor: AppColors.primary,
                   shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                onPressed: () {
                   ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Application feature coming soon')));
                },
                child: const Text('Apply Now', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoItem(IconData icon, String label) {
    return Column(
      children: [
        Icon(icon, color: AppColors.primary),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildBulletPoint(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('• ', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primary)),
          Expanded(child: Text(text, style: const TextStyle(height: 1.3))),
        ],
      ),
    );
  }
}
