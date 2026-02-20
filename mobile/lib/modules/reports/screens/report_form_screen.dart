import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:firebase_auth/firebase_auth.dart';
import '../../../config/api_config.dart';
import '../services/location_service.dart';

class ReportFormScreen extends StatefulWidget {
  const ReportFormScreen({super.key});

  @override
  State<ReportFormScreen> createState() => _ReportFormScreenState();
}

class _ReportFormScreenState extends State<ReportFormScreen> {
  File? _image;
  final ImagePicker _picker = ImagePicker();
  final LocationService _locationService = LocationService();
  final TextEditingController _descriptionController = TextEditingController();
  String? _category;
  Map<String, double>? _location;
  bool _isLocating = false;
  bool _isSubmitting = false;

  Future<void> _captureImage() async {
    final XFile? photo = await _picker.pickImage(source: ImageSource.camera);
    if (photo != null) {
      File imageFile = File(photo.path);
      setState(() {
        _image = imageFile;
        _isLocating = true;
      });

      try {
        final exifLoc = await _locationService.getExifLocation(imageFile);
        if (exifLoc != null) {
          setState(() => _location = exifLoc);
        } else {
          final gpsLoc = await _locationService.getCurrentLocation();
          if (gpsLoc != null) {
            setState(
              () => _location = {
                'latitude': gpsLoc.latitude!,
                'longitude': gpsLoc.longitude!,
              },
            );
          }
        }
      } finally {
        setState(() => _isLocating = false);
      }
    }
  }

  Future<void> _submitReport() async {
    if (_image == null || _category == null || _location == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Please provide all details (image, category, location)',
          ),
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final user = FirebaseAuth.instance.currentUser;
      String identifier = user?.phoneNumber ?? user?.email ?? 'anonymous';
      if (identifier.trim().isEmpty) identifier = 'anonymous';

      var request = http.MultipartRequest(
        'POST',
        Uri.parse(ApiConfig.reportsUrl),
      );
      request.fields['category'] = _category!;
      request.fields['description'] = _descriptionController.text;
      request.fields['latitude'] = _location!['latitude'].toString();
      request.fields['longitude'] = _location!['longitude'].toString();
      request.fields['citizen_phone'] = identifier;

      final extension = _image!.path.split('.').last.toLowerCase();
      final subType = (extension == 'jpg' || extension == 'jpeg')
          ? 'jpeg'
          : extension;

      request.files.add(
        await http.MultipartFile.fromPath(
          'image',
          _image!.path,
          contentType: http.MediaType('image', subType),
        ),
      );

      var response = await request.send();
      final responseBody = await response.stream.bytesToString();

      if (response.statusCode == 201) {
        if (!mounted) return;
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Issue reported successfully!'),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
          ),
        );
      } else {
        Map<String, dynamic> errorData = {};
        try {
          errorData = json.decode(responseBody);
        } catch (_) {}
        throw Exception(
          errorData['error'] ??
              'Failed to submit report (${response.statusCode})',
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text(
          'Report Issue',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        elevation: 0,
        backgroundColor: theme.appBarTheme.backgroundColor,
        foregroundColor: theme.appBarTheme.foregroundColor,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Capture Evidence',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            GestureDetector(
              onTap: _captureImage,
              child: Container(
                height: 220,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: theme.cardColor,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: theme.dividerColor),
                  image: _image != null
                      ? DecorationImage(
                          image: FileImage(_image!),
                          fit: BoxFit.cover,
                        )
                      : null,
                ),
                child: _image == null
                    ? Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.add_a_photo_outlined,
                            size: 50,
                            color: theme.hintColor.withValues(alpha: 0.4),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Tap to open camera',
                            style: TextStyle(color: theme.hintColor),
                          ),
                        ],
                      )
                    : null,
              ),
            ),
            const SizedBox(height: 24),
            _buildSectionHeader('Location Details'),
            const SizedBox(height: 12),
            _buildLocationCard(theme),
            const SizedBox(height: 24),
            _buildSectionHeader('Report Description'),
            const SizedBox(height: 12),
            _buildInputFields(),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _isSubmitting ? null : _submitReport,
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 56),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              child: _isSubmitting
                  ? CircularProgressIndicator(
                      color: theme.colorScheme.onPrimary,
                    )
                  : const Text(
                      'Submit Report',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
    );
  }

  Widget _buildLocationCard(ThemeData theme) {
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
                if (_isLocating)
                  const LinearProgressIndicator(minHeight: 2)
                else if (_location == null)
                  const Text(
                    'No location captured',
                    style: TextStyle(color: Colors.grey),
                  )
                else
                  Text(
                    '${_location!['latitude']!.toStringAsFixed(6)}, ${_location!['longitude']!.toStringAsFixed(6)}',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                const Text(
                  'Coordinates extracted from photo',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputFields() {
    return Column(
      children: [
        DropdownButtonFormField<String>(
          initialValue: _category,
          decoration: const InputDecoration(labelText: 'Issue Category'),
          items:
              [
                    'Waste Management',
                    'Road/Potholes',
                    'Street Light',
                    'Water Leakage',
                    'Other',
                  ]
                  .map(
                    (label) =>
                        DropdownMenuItem(value: label, child: Text(label)),
                  )
                  .toList(),
          onChanged: (value) => setState(() => _category = value),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _descriptionController,
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
