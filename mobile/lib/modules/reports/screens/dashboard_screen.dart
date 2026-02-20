import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../../config/api_config.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => DashboardScreenState();
}

class DashboardScreenState extends State<DashboardScreen> {
  Map<String, dynamic> _stats = {
    'summary': [
      {'title': 'Total Issues', 'value': 0},
      {'title': 'Resolved', 'value': 0},
    ]
  };
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchStats();
  }

  void refreshStats() => _fetchStats();

  Future<void> _fetchStats() async {
    try {
      final response = await http.get(Uri.parse(ApiConfig.statsUrl));
      if (response.statusCode == 200) {
        setState(() {
          _stats = json.decode(response.body);
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching stats: $e');
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final totalIssues = _stats['summary'].firstWhere((s) => s['title'] == 'Total Issues', orElse: () => {'value': 0})['value'].toString();
    final resolvedIssues = _stats['summary'].firstWhere((s) => s['title'] == 'Resolved', orElse: () => {'value': 0})['value'].toString();

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _fetchStats,
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              expandedHeight: 120.0,
              floating: false,
              pinned: true,
              flexibleSpace: FlexibleSpaceBar(
                title: Text('CivicConnect', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                background: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [theme.colorScheme.primary, theme.colorScheme.secondary],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Welcome back, Citizen!',
                      style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Help us keep the city clean and safe.',
                      style: theme.textTheme.bodyMedium?.copyWith(color: theme.hintColor),
                    ),
                    const SizedBox(height: 24),
                    _isLoading
                        ? const Center(child: CircularProgressIndicator())
                        : Row(
                            children: [
                              Expanded(
                                child: _StatsCard(
                                  title: 'Reports',
                                  value: totalIssues,
                                  color: theme.colorScheme.primary,
                                  icon: Icons.assignment_outlined,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: _StatsCard(
                                  title: 'Resolved',
                                  value: resolvedIssues,
                                  color: Colors.green,
                                  icon: Icons.check_circle_outline,
                                ),
                              ),
                            ],
                          ),
                    const SizedBox(height: 24),
                    Text(
                      'Quick Actions',
                      style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    _ActionCard(
                      title: 'Report New Issue',
                      subtitle: 'Snap a photo and describe the problem',
                      icon: Icons.camera_alt,
                      onTap: () => Navigator.pushNamed(context, '/report'),
                    ),
                    const SizedBox(height: 12),
                    _ActionCard(
                      title: 'View Nearby Issues',
                      subtitle: 'See what\'s happening in your area',
                      icon: Icons.map_outlined,
                      onTap: () => Navigator.pushNamed(context, '/nearby-issues'),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatsCard extends StatelessWidget {
  final String title;
  final String value;
  final Color color;
  final IconData icon;

  const _StatsCard({
    required this.title,
    required this.value,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 12),
          Text(
            value,
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: color),
          ),
          Text(
            title,
            style: TextStyle(color: color.withValues(alpha: 0.8), fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;

  const _ActionCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: theme.cardColor,
          borderRadius: BorderRadius.circular(16),
          boxShadow: theme.brightness == Brightness.dark ? [] : [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
          border: theme.brightness == Brightness.dark ? Border.all(color: theme.dividerColor) : null,
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: theme.colorScheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: theme.colorScheme.primary),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  Text(
                    subtitle,
                    style: TextStyle(color: theme.hintColor, fontSize: 13),
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: theme.hintColor),
          ],
        ),
      ),
    );
  }
}
