import 'package:flutter/material.dart';
import '../services/notification_service.dart';

class NotificationListScreen extends StatefulWidget {
  const NotificationListScreen({super.key});

  @override
  State<NotificationListScreen> createState() => _NotificationListScreenState();
}

class _NotificationListScreenState extends State<NotificationListScreen> {
  final NotificationService _notificationService = NotificationService();
  List<dynamic> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() => _isLoading = true);
    final notifications = await _notificationService.getNotifications();
    setState(() {
      _notifications = notifications;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications', style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadNotifications),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _notifications.isEmpty
              ? const Center(child: Text('No notifications yet'))
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: _notifications.length,
                  separatorBuilder: (context, index) => const Divider(),
                  itemBuilder: (context, index) {
                    final notification = _notifications[index];
                    final isRead = notification['is_read'] ?? false;

                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: isRead ? Colors.grey[200] : theme.colorScheme.primary.withValues(alpha: 0.1),
                        child: Icon(
                          _getIconForType(notification['type']),
                          color: isRead ? Colors.grey : theme.colorScheme.primary,
                        ),
                      ),
                      title: Text(
                        notification['title'] ?? 'Notification',
                        style: TextStyle(
                          fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
                        ),
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(notification['body'] ?? ''),
                          const SizedBox(height: 4),
                          Text(
                            notification['createdAt'] != null ? notification['createdAt'].toString().substring(0, 10) : '',
                            style: const TextStyle(fontSize: 12, color: Colors.grey),
                          ),
                        ],
                      ),
                      onTap: () async {
                        if (!isRead) {
                          await _notificationService.markAsRead(notification['id']);
                          _loadNotifications();
                        }
                        // Handle navigation to related report if data exists
                      },
                    );
                  },
                ),
    );
  }

  IconData _getIconForType(String? type) {
    switch (type) {
      case 'Update':
        return Icons.update;
      case 'Alert':
        return Icons.warning_amber_rounded;
      case 'Success':
        return Icons.check_circle_outline;
      default:
        return Icons.notifications_none;
    }
  }
}
