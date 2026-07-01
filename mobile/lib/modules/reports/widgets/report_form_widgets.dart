import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart' as ll;
import '../screens/location_picker_screen.dart';

class LocationCard extends StatelessWidget {
  final Map<String, double>? location;
  final bool isLocating;
  final Function(Map<String, double>) onLocationSelected;

  const LocationCard({
    super.key,
    required this.location,
    required this.isLocating,
    required this.onLocationSelected,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.dividerColor),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: theme.colorScheme.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(Icons.location_on, color: theme.colorScheme.primary),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (isLocating)
                  const LinearProgressIndicator(minHeight: 2)
                else if (location == null)
                  const Text(
                    'No location captured',
                    style: TextStyle(color: Colors.grey),
                  )
                else
                  Text(
                    '${location!['latitude']!.toStringAsFixed(6)}, ${location!['longitude']!.toStringAsFixed(6)}',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                const Text(
                  'Coordinates extracted from photo',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ],
            ),
          ),
          TextButton.icon(
            onPressed: () async {
              final ll.LatLng? result = await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => LocationPickerScreen(
                    initialLocation: location != null
                        ? ll.LatLng(location!['latitude']!, location!['longitude']!)
                        : null,
                  ),
                ),
              );
              if (result != null) {
                onLocationSelected({
                  'latitude': result.latitude,
                  'longitude': result.longitude,
                });
              }
            },
            icon: const Icon(Icons.map),
            label: const Text('Map'),
          ),
        ],
      ),
    );
  }
}

class ReportInputFields extends StatelessWidget {
  final String? category;
  final TextEditingController descriptionController;
  final Function(String?) onCategoryChanged;

  const ReportInputFields({
    super.key,
    required this.category,
    required this.descriptionController,
    required this.onCategoryChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        DropdownButtonFormField<String>(
          initialValue: category,
          decoration: const InputDecoration(labelText: 'Issue Category'),
          items: [
            'Waste Management',
            'Road/Potholes',
            'Street Light',
            'Water Leakage',
            'Other',
          ]
              .map(
                (label) => DropdownMenuItem(value: label, child: Text(label)),
              )
              .toList(),
          onChanged: onCategoryChanged,
        ),
        const SizedBox(height: 16),
        TextField(
          controller: descriptionController,
          maxLines: 4,
          decoration: const InputDecoration(
            labelText: 'Briefly describe the issue',
            alignLabelWithHint: true,
          ),
        ),
      ],
    );
  }
}
