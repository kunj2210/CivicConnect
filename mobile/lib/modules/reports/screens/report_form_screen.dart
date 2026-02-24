import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:firebase_auth/firebase_auth.dart';
import 'package:hive/hive.dart';
import '../../../config/api_config.dart';
import '../services/location_service.dart';
import '../services/sync_service.dart';
import '../models/report_draft.dart';
import './location_picker_screen.dart';
import 'package:latlong2/latlong.dart' as ll;
import 'package:path_provider/path_provider.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:http_parser/http_parser.dart' as http_parser;

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

  Future<void> _showImageSourceDialog() async {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: Text(
                'Select Image Source',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Camera'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Gallery'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.gallery);
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Future<void> _pickImage(ImageSource source) async {
    final XFile? photo = await _picker.pickImage(source: source);
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

    File fileToUpload = _image!;
    try {
      final dir = await getTemporaryDirectory();
      final targetPath = '${dir.absolute.path}/compressed_${DateTime.now().millisecondsSinceEpoch}.jpg';
      final result = await FlutterImageCompress.compressAndGetFile(
        _image!.absolute.path,
        targetPath,
        quality: 60,
        format: CompressFormat.jpeg,
      );
      if (result != null) {
        fileToUpload = File(result.path);
        debugPrint("Compressed image from ${_image!.lengthSync()} to ${fileToUpload.lengthSync()} bytes.");
      }
    } catch (e) {
      debugPrint("Compression failed: $e");
    }

    try {
      final user = FirebaseAuth.instance.currentUser;
      String identifier = (user?.phoneNumber != null && user!.phoneNumber!.isNotEmpty)
          ? user.phoneNumber!
          : (user?.email != null && user!.email!.isNotEmpty)
              ? user.email!
              : (user?.uid ?? 'anonymous');

      var request = http.MultipartRequest(
        'POST',
        Uri.parse(ApiConfig.reportsUrl),
      );
      request.fields['category'] = _category!;
      request.fields['description'] = _descriptionController.text;
      request.fields['latitude'] = _location!['latitude'].toString();
      request.fields['longitude'] = _location!['longitude'].toString();
      request.fields['citizen_phone'] = identifier;

      final extension = fileToUpload.path.split('.').last.toLowerCase();
      final subType = (extension == 'jpg' || extension == 'jpeg')
          ? 'jpeg'
          : extension;

      request.files.add(
        await http.MultipartFile.fromPath(
          'image',
          fileToUpload.path,
          contentType: http_parser.MediaType('image', subType),
        ),
      );

      var response = await request.send().timeout(const Duration(seconds: 30));
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
        throw Exception('Server returned ${response.statusCode}');
      }
    } catch (e) {
      // Offline / Error handling
      debugPrint("Submission error: $e");
      
      try {
        final box = Hive.box<ReportDraft>('report_drafts');
        final user = FirebaseAuth.instance.currentUser;
        final identifier = user?.phoneNumber ?? user?.email ?? user?.uid ?? 'anonymous';
        
        final draft = ReportDraft(
          category: _category!,
          description: _descriptionController.text,
          imagePath: fileToUpload.path,
          latitude: _location!['latitude']!,
          longitude: _location!['longitude']!,
          timestamp: DateTime.now(),
          citizenPhone: identifier,
        );
        
        await box.add(draft);
        SyncService.scheduleSync();
        
        if (!mounted) return;
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Saved as draft. Will sync when online.'),
            backgroundColor: Colors.orange,
            behavior: SnackBarBehavior.floating,
          ),
        );
      } catch (hiveError) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
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
              onTap: _showImageSourceDialog,
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
                            'Tap to add photo',
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
          TextButton.icon(
            onPressed: () async {
              final ll.LatLng? result = await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => LocationPickerScreen(
                    initialLocation: _location != null
                        ? ll.LatLng(_location!['latitude']!,
                            _location!['longitude']!)
                        : null,
                  ),
                ),
              );
              if (result != null) {
                setState(() {
                  _location = {
                    'latitude': result.latitude,
                    'longitude': result.longitude,
                  };
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
