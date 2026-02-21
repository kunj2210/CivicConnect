import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import '../../../config/api_config.dart';

class UserService {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  User? get currentUser => _auth.currentUser;

  Future<void> updateProfile({String? displayName, String? photoURL}) async {
    final user = _auth.currentUser;
    if (user != null) {
      await user.updateDisplayName(displayName);
      await user.updatePhotoURL(photoURL);
      await user.reload();
    }
  }

  Future<Map<String, dynamic>> getUserStats() async {
    final user = _auth.currentUser;
    if (user == null) return {'total': 0, 'resolved': 0, 'rank': 'Newbie'};

    try {
      // Assuming stats endpoint takes citizen_phone or email
      final identifier = user.phoneNumber ?? user.email ?? '';
      final response = await http.get(Uri.parse('${ApiConfig.statsUrl}?citizen_phone=$identifier'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'total': data['total'].toString(),
          'resolved': data['resolved'].toString(),
          'rank': data['rank'] ?? 'Newbie',
        };
      }
      return {'total': '0', 'resolved': '0', 'rank': 'Newbie'};
    } catch (e) {
      debugPrint('Error fetching user stats: $e');
      return {'total': '0', 'resolved': '0', 'rank': 'Newbie'};
    }
  }
}
