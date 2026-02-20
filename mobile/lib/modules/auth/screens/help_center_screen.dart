import 'package:flutter/material.dart';

class HelpCenterScreen extends StatelessWidget {
  const HelpCenterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Help Center', style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const Text(
            'How can we help you?',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 24),
          _buildSearchField(),
          const SizedBox(height: 32),
          const Text('Frequently Asked Questions', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          const SizedBox(height: 16),
          _buildFaqItem(
            'How do I report an issue?',
            'You can report an issue by tapping the "+" button on the home screen or navigation bar, filling in the details, and attaching a photo if possible.',
          ),
          _buildFaqItem(
            'How long does it take for a resolution?',
            'Resolution times vary by department and issue type. You can track the progress of your report in the "My Reports" section.',
          ),
          _buildFaqItem(
            'Is my report anonymous?',
            'By default, reports include your name for accountability, but you can choose to hide your identity in specific cases depending on local government policies.',
          ),
          const SizedBox(height: 32),
          const Text('Contact Us', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          const SizedBox(height: 16),
          _buildContactTile(Icons.email_outlined, 'Email Support', 'support@civicconnect.gov'),
          _buildContactTile(Icons.phone_outlined, 'Call Helpline', '1800-CIVIC-CON'),
          _buildContactTile(Icons.language_outlined, 'Official Website', 'www.civicconnect.gov'),
        ],
      ),
    );
  }

  Widget _buildSearchField() {
    return TextField(
      decoration: InputDecoration(
        hintText: 'Search FAQ...',
        prefixIcon: const Icon(Icons.search),
        filled: true,
        fillColor: Colors.grey.withValues(alpha: 0.1),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }

  Widget _buildFaqItem(String question, String answer) {
    return ExpansionTile(
      title: Text(question, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
      tilePadding: EdgeInsets.zero,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          child: Text(answer, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
        ),
      ],
    );
  }

  Widget _buildContactTile(IconData icon, String title, String subtitle) {
    return ListTile(
      leading: Icon(icon, color: Colors.blue),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
      onTap: () {},
      contentPadding: EdgeInsets.zero,
    );
  }
}
