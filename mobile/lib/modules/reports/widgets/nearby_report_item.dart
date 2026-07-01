import 'package:flutter/material.dart';
import '../screens/report_detail_screen.dart';

class NearbyReportListItem extends StatelessWidget {
  final Map<String, dynamic> report;

  const NearbyReportListItem({super.key, required this.report});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final distance = report['distance'] as double;
    final distanceStr = distance < 1.0 
        ? '${(distance * 1000).toInt()} m away' 
        : '${distance.toStringAsFixed(1)} km away';

    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => ReportDetailScreen(reportId: report['id'])),
      ),
      child: Container(
        decoration: BoxDecoration(
          color: theme.cardColor,
          borderRadius: BorderRadius.circular(16),
          boxShadow: theme.brightness == Brightness.dark ? [] : [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
          border: theme.brightness == Brightness.dark ? Border.all(color: theme.dividerColor) : null,
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    report['category'] ?? 'General',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.location_on, size: 12, color: theme.colorScheme.primary),
                        const SizedBox(width: 4),
                        Text(
                          distanceStr,
                          style: TextStyle(
                            color: theme.colorScheme.primary,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                report['description'] ?? 'No description provided.',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(color: theme.hintColor, fontSize: 14),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  StatusBadge(
                    status: report['status'] ?? 'Submitted',
                    color: (report['status'] == 'Resolved') ? Colors.green : (report['status'] == 'In Progress' ? Colors.orange : theme.colorScheme.primary),
                  ),
                  Text(
                    'View Details',
                    style: TextStyle(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class StatusBadge extends StatelessWidget {
  final String status;
  final Color color;

  const StatusBadge({super.key, required this.status, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
