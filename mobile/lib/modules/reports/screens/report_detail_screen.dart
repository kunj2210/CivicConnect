import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../../config/api_config.dart';

class ReportDetailScreen extends StatefulWidget {
  final String reportId;

  const ReportDetailScreen({super.key, required this.reportId});

  @override
  State<ReportDetailScreen> createState() => _ReportDetailScreenState();
}

class _ReportDetailScreenState extends State<ReportDetailScreen> {
  Map<String, dynamic>? _report;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchReportDetails();
  }

  Future<void> _fetchReportDetails() async {
    try {
      final response = await http.get(Uri.parse('${ApiConfig.reportsUrl}/${widget.reportId}'));
      if (response.statusCode == 200) {
        setState(() {
          _report = json.decode(response.body);
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to load report');
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_error != null || _report == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Details')),
        body: Center(child: Text('Error: ${_error ?? "Report not found"}')),
      );
    }

    final metadata = _report!['metadata'] ?? {};
    final status = _report!['status'] ?? 'Pending';
    final coords = _report!['location']?['coordinates'] ?? [0, 0];

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 250,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Image.network(
                metadata['image_url'] ?? 'https://via.placeholder.com/400x300',
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                  color: Colors.grey[200],
                  child: const Icon(Icons.broken_image, size: 50, color: Colors.grey),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                   Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _report!['category'] ?? 'General',
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                      ),
                      _StatusBadge(status: status),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Submited on ${DateTime.parse(_report!['timestamp']).toLocal().toString().split('.')[0]}',
                    style: TextStyle(color: Colors.grey[500], fontSize: 13),
                  ),
                  const Divider(height: 32),
                  
                  const _SectionHeader(icon: Icons.description_outlined, title: 'Description'),
                  const SizedBox(height: 8),
                  Text(
                    metadata['description'] ?? 'No description provided.',
                    style: TextStyle(color: Colors.grey[700], fontSize: 16, height: 1.5),
                  ),
                  const SizedBox(height: 24),
                  
                  const _SectionHeader(icon: Icons.location_on_outlined, title: 'Location'),
                  const SizedBox(height: 8),
                  Text(
                    'Latitude: ${coords[1]}, Longitude: ${coords[0]}',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                  if (metadata['jurisdiction'] != null)
                    Text(
                      'Jurisdiction: ${metadata['jurisdiction']}',
                      style: const TextStyle(color: Color(0xFF0052CC), fontWeight: FontWeight.bold),
                    ),
                  
                  const SizedBox(height: 24),
                  const _SectionHeader(icon: Icons.info_outline, title: 'Report ID'),
                  const SizedBox(height: 4),
                  Text(
                    _report!['report_id'],
                    style: const TextStyle(fontFamily: 'Courier', fontSize: 12),
                  ),
                  
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final IconData icon;
  final String title;

  const _SectionHeader({required this.icon, required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 20, color: const Color(0xFF0052CC)),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey),
        ),
      ],
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;

  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    Color color = const Color(0xFF0052CC);
    if (status == 'Resolved') color = Colors.green;
    if (status == 'In Progress') color = Colors.orange;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.5)),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }
}
