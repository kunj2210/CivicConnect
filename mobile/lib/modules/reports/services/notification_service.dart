import 'dart:convert';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../../../config/api_config.dart';

class NotificationService {
  final SupabaseClient _client = Supabase.instance.client;
  final FlutterLocalNotificationsPlugin _localNotificationsPlugin = FlutterLocalNotificationsPlugin();
  RealtimeChannel? _notificationChannel;

  Future<void> initialize(BuildContext context) async {
    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosInit = DarwinInitializationSettings();
    const initSettings = InitializationSettings(android: androidInit, iOS: iosInit);
    
    await _localNotificationsPlugin.initialize(initSettings);
    
    _localNotificationsPlugin
      .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
      ?.requestNotificationsPermission();

    _client.auth.onAuthStateChange.listen((data) async {
      final session = data.session;
      if (session != null) {
        final user = session.user;
        _setupRealtimeSubscription(user.id);
      } else {
        _notificationChannel?.unsubscribe();
        _notificationChannel = null;
      }
    });
  }

  void _setupRealtimeSubscription(String userId) {
    if (_notificationChannel != null) return;

    _notificationChannel = _client.channel('notifications:$userId');
    _notificationChannel!.onBroadcast(
      event: 'new_notification',
      callback: (payload) {
        _showLocalNotification(
          payload['title'] ?? 'CivicConnect Update', 
          payload['body'] ?? ''
        );
      }
    ).subscribe();
  }

  Future<void> _showLocalNotification(String title, String body) async {
    const androidDetails = AndroidNotificationDetails(
      'civic_updates', 
      'Civic Updates',
      channelDescription: 'Important updates about your reports',
      importance: Importance.max,
      priority: Priority.high,
    );
    const notificationDetails = NotificationDetails(android: androidDetails, iOS: DarwinNotificationDetails());
    
    await _localNotificationsPlugin.show(
      DateTime.now().millisecond,
      title,
      body,
      notificationDetails,
    );
  }
  Future<List<dynamic>> getNotifications() async {
    final user = _client.auth.currentUser;
    if (user == null) return [];

    final identifier = user.phone ?? user.email ?? user.id;
    try {
      final response = await http.get(Uri.parse('${ApiConfig.baseUrl}/notifications?user_id=$identifier'));
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      return [];
    } catch (e) {
      debugPrint('Error fetching notifications: $e');
      return [];
    }
  }

  Future<void> markAsRead(int notificationId) async {
    try {
      await http.patch(Uri.parse('${ApiConfig.baseUrl}/notifications/$notificationId/read'));
    } catch (e) {
      debugPrint('Error marking notification as read: $e');
    }
  }
}
