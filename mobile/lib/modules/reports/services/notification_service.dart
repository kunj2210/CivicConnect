import 'dart:convert';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../../config/api_config.dart';

class NotificationService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  Future<void> initialize(BuildContext context) async {
    // Request permission
    NotificationSettings settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      debugPrint('User granted notification permission');
      
      // Handle foreground messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        if (context.mounted) {
          _handleForegroundMessage(context, message);
        }
      });

      // Listen to auth changes and register token
      _auth.authStateChanges().listen((User? user) async {
        if (user != null) {
          String? token = await _messaging.getToken();
          if (token != null) {
            debugPrint('DEBUG: FCM Token retrieved: $token');
            await _registerToken(token);
          }
        }
      });

      // Listen for token refreshes
      _messaging.onTokenRefresh.listen((token) async {
        final user = _auth.currentUser;
        if (user != null) {
          await _registerToken(token);
        }
      });
    }
  }

  Future<void> _registerToken(String token) async {
    final user = _auth.currentUser;
    if (user == null) return;

    // Use a robust identifier. 
    // If phone and email are both empty, use the Firebase UID as a fallback.
    String identifier = (user.phoneNumber != null && user.phoneNumber!.isNotEmpty)
        ? user.phoneNumber!
        : (user.email != null && user.email!.isNotEmpty)
            ? user.email!
            : user.uid;
    
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/notifications/register-fcm'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'user_id': identifier,
          'fcm_token': token,
        }),
      );

      if (response.statusCode == 200) {
        debugPrint('FCM Token registered successfully');
      } else {
        debugPrint('Failed to register FCM Token: ${response.body}');
      }
    } catch (e) {
      debugPrint('Error registering FCM token: $e');
    }
  }

  void _handleForegroundMessage(BuildContext context, RemoteMessage message) {
    debugPrint('Foreground message received: ${message.notification?.title}');
    
    // Show a snackbar or dialog
    if (message.notification != null && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                message.notification!.title ?? 'New Notification',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              Text(message.notification!.body ?? ''),
            ],
          ),
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 5),
          action: SnackBarAction(
            label: 'View',
            onPressed: () {
              // Handle tap, e.g., navigate to report detail
            },
          ),
        ),
      );
    }
  }
}
