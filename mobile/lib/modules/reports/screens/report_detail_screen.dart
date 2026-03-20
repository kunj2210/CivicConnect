import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../services/report_service.dart';

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
  final ReportService _reportService = ReportService();
  bool _isUpvoting = false;
  bool _isConfirming = false;

  @override
  void initState() {
    super.initState();
    _fetchReportDetails();
  }

  Future<void> _fetchReportDetails() async {
    setState(() => _isLoading = true);
    try {
      final data = await _reportService.getReportById(widget.reportId);
      setState(() {
        _report = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _handleUpvote() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    final identifier = user.phoneNumber ?? user.email ?? user.uid;
    
    setState(() => _isUpvoting = true);
    try {
      await _reportService.upvoteReport(widget.reportId, identifier);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Report upvoted!'), backgroundColor: Colors.green),
      );
      _fetchReportDetails(); // Refresh to get new priority/stats if any
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Upvote failed: ${e.toString().replaceAll('Exception: ', '')}'), backgroundColor: Colors.red),
      );
    } finally {
      setState(() => _isUpvoting = false);
    }
  }

  Future<void> _handleConfirmResolution(int rating) async {
    setState(() => _isConfirming = true);
    try {
      await _reportService.confirmResolution(widget.reportId, rating);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Resolution confirmed. Thank you!'), backgroundColor: Colors.green),
      );
      _fetchReportDetails();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Confirmation failed: $e'), backgroundColor: Colors.red),
      );
    } finally {
      setState(() => _isConfirming = false);
    }
  }

  void _showRatingDialog() {
    int selectedRating = 5;
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Rate Resolution'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('How satisfied are you with the work?'),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) => IconButton(
                  icon: Icon(
                    index < selectedRating ? Icons.star : Icons.star_border,
                    color: Colors.amber,
                    size: 32,
                  ),
                  onPressed: () => setDialogState(() => selectedRating = index + 1),
                )),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _handleConfirmResolution(selectedRating);
              },
              child: const Text('Confirm'),
            ),
          ],
        ),
      ),
    );
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

    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final textTheme = theme.textTheme;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
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
                  color: colorScheme.surfaceContainerHighest,
                  child: Icon(Icons.broken_image, size: 50, color: colorScheme.onSurfaceVariant),
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
                      Expanded(
                        child: Text(
                          _report!['category'] ?? 'General',
                          style: textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      _StatusBadge(status: status),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Submitted on ${DateTime.parse(_report!['timestamp']).toLocal().toString().split('.')[0]}',
                    style: textTheme.bodySmall?.copyWith(color: colorScheme.onSurfaceVariant),
                  ),
                  const Divider(height: 32),
                  
                  const _SectionHeader(icon: Icons.description_outlined, title: 'Description'),
                  const SizedBox(height: 8),
                  Text(
                    metadata['description'] ?? 'No description provided.',
                    style: textTheme.bodyLarge?.copyWith(color: colorScheme.onSurface, height: 1.5),
                  ),
                  const SizedBox(height: 24),
                  
                  const _SectionHeader(icon: Icons.location_on_outlined, title: 'Location'),
                  const SizedBox(height: 8),
                  Text(
                    'Latitude: ${coords[1]}, Longitude: ${coords[0]}',
                    style: textTheme.bodyMedium?.copyWith(color: colorScheme.onSurfaceVariant),
                  ),
                  if (metadata['jurisdiction'] != null)
                    Text(
                      'Jurisdiction: ${metadata['jurisdiction']}',
                      style: textTheme.bodyMedium?.copyWith(
                        color: colorScheme.primary, 
                        fontWeight: FontWeight.bold
                      ),
                    ),
                  
                  const SizedBox(height: 24),
                  const _SectionHeader(icon: Icons.info_outline, title: 'Report ID'),
                  const SizedBox(height: 4),
                  Text(
                    _report!['report_id'],
                    style: textTheme.bodySmall?.copyWith(
                      fontFamily: 'Courier',
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  
                  const Divider(height: 48),

                  if (status == 'Pending Confirmation') ...[
                    const _SectionHeader(icon: Icons.rate_review_outlined, title: 'Action Required'),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.orange.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.orange.withValues(alpha: 0.3)),
                      ),
                      child: Column(
                        children: [
                          const Text(
                            'The department has marked this issue as resolved. Please review and confirm.',
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                          if (metadata['resolution_image_url'] != null) ...[
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.network(
                                metadata['resolution_image_url'],
                                height: 150,
                                width: double.infinity,
                                fit: BoxFit.cover,
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],
                          ElevatedButton(
                            onPressed: _isConfirming ? null : _showRatingDialog,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              minimumSize: const Size(double.infinity, 48),
                            ),
                            child: _isConfirming 
                              ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                              : const Text('Confirm & Close'),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _isUpvoting ? null : _handleUpvote,
                          icon: _isUpvoting 
                            ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2))
                            : const Icon(Icons.thumb_up_outlined),
                          label: Text('Upvote (${metadata['upvote_count'] ?? 0})'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                    ],
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
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Row(
      children: [
        Icon(icon, size: 20, color: colorScheme.primary),
        const SizedBox(width: 8),
        Text(
          title,
          style: theme.textTheme.labelLarge?.copyWith(
            color: colorScheme.onSurfaceVariant,
            fontWeight: FontWeight.bold,
          ),
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
    final colorScheme = Theme.of(context).colorScheme;
    Color color = colorScheme.primary;
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
