import 'package:flutter/material.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('About CivicConnect', style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const SizedBox(height: 20),
            Image.asset(
              'assets/images/logo.png',
              height: 100,
              fit: BoxFit.contain,
            ),
            const SizedBox(height: 24),
            const Text(
              'CivicConnect',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
            Text(
              'Version 2.0.4',
              style: TextStyle(color: Colors.grey[600]),
            ),
            const SizedBox(height: 40),
            const Text(
              'CivicConnect is a unified platform designed to bridge the gap between citizens and local government. Our mission is to make civic reporting easy, transparent, and efficient.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 16, height: 1.5),
            ),
            const SizedBox(height: 48),
            _buildInfoTile('Our Mission', 'Transparent Governance'),
            _buildInfoTile('Developer', 'GovTech Solutions'),
            _buildInfoTile('Privacy Policy', 'Read Policy Details'),
            _buildInfoTile('Terms of Service', 'View Terms'),
            const SizedBox(height: 40),
            Text(
              '© 2026 GovTech Solutions. All rights reserved.',
              style: TextStyle(color: Colors.grey[500], fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoTile(String title, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
          Text(value, style: const TextStyle(color: Colors.blue)),
        ],
      ),
    );
  }
}
