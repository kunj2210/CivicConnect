import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:hive/hive.dart';
import '../../../config/api_config.dart';
import '../services/location_service.dart';
import '../services/sync_service.dart';
import '../models/report_draft.dart';
import 'package:path_provider/path_provider.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:http_parser/http_parser.dart' as http_parser;
import '../widgets/audio_recording_widget.dart';
import '../widgets/report_form_widgets.dart';

class ReportFormScreen extends StatefulWidget {
  const ReportFormScreen({super.key});

  @override
  State<ReportFormScreen> createState() => _ReportFormScreenState();
}

class _ReportFormScreenState extends State<ReportFormScreen> {
  File? _image;
  XFile? _pickedImage;
  Uint8List? _imageBytes;
  final ImagePicker _picker = ImagePicker();
  final LocationService _locationService = LocationService();
  final TextEditingController _descriptionController = TextEditingController();
  String? _category;
  Map<String, double>? _location;
  String? _audioPath;
  Uint8List? _audioBytes;
  String? _audioFilename;
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
    if (!mounted) return;
    if (photo != null) {
      final bytes = await photo.readAsBytes();
      if (!mounted) return;

      setState(() {
        _pickedImage = photo;
        _imageBytes = bytes;
        _isLocating = true;

        if (!kIsWeb) {
          _image = File(photo.path);
        }
      });

      try {
        final exifLoc = await _locationService.getExifLocation(bytes);
        if (!mounted) return;
        if (exifLoc != null) {
          setState(() => _location = exifLoc);
        } else {
          final gpsLoc = await _locationService.getCurrentLocation();
          if (!mounted) return;
          if (gpsLoc != null) {
            setState(
              () => _location = {
                'latitude': gpsLoc.latitude,
                'longitude': gpsLoc.longitude,
              },
            );
          } else {
            if (!mounted) return;
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Could not get precise GPS lock. Please select location manually on map.'),
                duration: Duration(seconds: 4),
              ),
            );
          }
        }
      } finally {
        if (mounted) {
          setState(() => _isLocating = false);
        }
      }
    }
  }

  Future<void> _submitReport() async {
    if ((_image == null && _imageBytes == null) || _category == null || _location == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please provide all details (image, category, location)'),
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    Uint8List? bytesToUpload = _imageBytes;
    String filename = 'image.jpg';

    if (!kIsWeb && _image != null) {
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

      bytesToUpload = await fileToUpload.readAsBytes();
      filename = fileToUpload.path.split('/').last;
    } else if (_imageBytes != null) {
      filename = _pickedImage?.name ?? 'image.jpg';
      if (!filename.contains('.')) {
        filename = '$filename.jpg';
      }
    }

    try {
      final user = Supabase.instance.client.auth.currentUser;
      String identifier = user?.phone ?? user?.email ?? user?.id ?? 'anonymous';

      var request = http.MultipartRequest(
        'POST',
        Uri.parse(ApiConfig.reportsUrl),
      );
      request.headers.addAll(ApiConfig.getHeaders(includeContentType: false));

      request.fields['category'] = _category!;
      request.fields['description'] = _descriptionController.text;
      request.fields['latitude'] = _location!['latitude'].toString();
      request.fields['longitude'] = _location!['longitude'].toString();
      request.fields['citizen_phone'] = identifier;

      final extension = filename.split('.').last.toLowerCase();
      final subType = (extension == 'jpg' || extension == 'jpeg') ? 'jpeg' : extension;

      request.files.add(
        http.MultipartFile.fromBytes(
          'image',
          bytesToUpload!,
          filename: filename,
          contentType: http_parser.MediaType('image', subType),
        ),
      );

      if (kIsWeb && _audioBytes != null) {
        final audioExtension = _audioFilename?.split('.').last.toLowerCase() ?? 'mp3';
        request.files.add(
          http.MultipartFile.fromBytes(
            'audio',
            _audioBytes!,
            filename: _audioFilename ?? 'audio.mp3',
            contentType: http_parser.MediaType('audio', audioExtension),
          ),
        );
      } else if (!kIsWeb && _audioPath != null) {
        final audioFile = File(_audioPath!);
        final audioExtension = _audioPath!.split('.').last.toLowerCase();
        request.files.add(
          await http.MultipartFile.fromPath(
            'audio',
            audioFile.path,
            contentType: http_parser.MediaType('audio', audioExtension),
          ),
        );
      }

      var response = await request.send().timeout(const Duration(seconds: 60));

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
        final resStr = await response.stream.bytesToString();
        String errorMessage = 'Server returned ${response.statusCode}';
        try {
          final errJson = json.decode(resStr);
          if (errJson['error'] != null) {
            errorMessage = errJson['error'];
          }
        } catch (_) {}
        throw Exception(errorMessage);
      }
    } catch (e) {
      debugPrint("Submission error: $e");
      try {
        final box = Hive.box<ReportDraft>('report_drafts');
        final user = Supabase.instance.client.auth.currentUser;
        final identifier = user?.phone ?? user?.email ?? user?.id ?? 'anonymous';

        final draft = ReportDraft(
          category: _category!,
          description: _descriptionController.text,
          imagePath: _image?.path ?? _pickedImage?.path ?? '',
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
        title: const Text('Report Issue', style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
        backgroundColor: theme.appBarTheme.backgroundColor,
        foregroundColor: theme.appBarTheme.foregroundColor,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Capture Evidence', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
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
                      ? DecorationImage(image: FileImage(_image!), fit: BoxFit.cover)
                      : _imageBytes != null
                          ? DecorationImage(image: MemoryImage(_imageBytes!), fit: BoxFit.cover)
                          : null,
                ),
                child: (_image == null && _imageBytes == null)
                    ? Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.add_a_photo_outlined, size: 50, color: theme.hintColor.withValues(alpha: 0.4)),
                          const SizedBox(height: 12),
                          Text('Tap to add photo', style: TextStyle(color: theme.hintColor)),
                        ],
                      )
                    : null,
              ),
            ),
            const SizedBox(height: 24),
            const Text('Location Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            LocationCard(
              location: _location,
              isLocating: _isLocating,
              onLocationSelected: (loc) => setState(() => _location = loc),
            ),
            const SizedBox(height: 24),
            const Text('Report Description', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            AudioRecordingWidget(
              onRecordingComplete: (path, bytes, name, transcription) {
                if (!mounted) return;
                setState(() {
                  _audioPath = path;
                  _audioBytes = bytes;
                  _audioFilename = name;
                });
                if (transcription != null && transcription.isNotEmpty) {
                  _descriptionController.text = transcription;
                }
              },
            ),
            const SizedBox(height: 16),
            ReportInputFields(
              category: _category,
              descriptionController: _descriptionController,
              onCategoryChanged: (val) => setState(() => _category = val),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _isSubmitting ? null : _submitReport,
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 56),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: _isSubmitting
                  ? CircularProgressIndicator(color: theme.colorScheme.onPrimary)
                  : const Text('Submit Report', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
