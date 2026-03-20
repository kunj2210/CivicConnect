import 'package:location/location.dart';
import 'package:flutter/foundation.dart';
import 'package:exif/exif.dart';

class LocationService {
  final Location _location = Location();

  Future<LocationData?> getCurrentLocation({int timeoutSeconds = 10}) async {
    bool serviceEnabled;
    PermissionStatus permissionGranted;

    serviceEnabled = await _location.serviceEnabled();
    if (!serviceEnabled) {
      serviceEnabled = await _location.requestService();
      if (!serviceEnabled) return null;
    }

    permissionGranted = await _location.hasPermission();
    if (permissionGranted == PermissionStatus.denied) {
      permissionGranted = await _location.requestPermission();
      if (permissionGranted != PermissionStatus.granted) return null;
    }

    // Phase 1 MVP: Accuracy Thresholding and Timeout
    try {
      final locData = await _location.getLocation().timeout(Duration(seconds: timeoutSeconds));
      if (locData.accuracy != null && locData.accuracy! <= 20.0) {
        return locData;
      } else {
        debugPrint("Location accuracy (${locData.accuracy}) exceeds 20m threshold. Rejecting.");
        return null; // Triggers UI fallback
      }
    } catch (e) {
      debugPrint("Location acquisition timed out or failed: $e");
      return null;
    }
  }

  /// Reads EXIF metadata from image bytes.
  ///
  /// This avoids using `dart:io` (File) on web, where dart:io file operations are unsupported.
  Future<Map<String, double>?> getExifLocation(Uint8List imageBytes) async {
    final data = await readExifFromBytes(imageBytes);

    if (data.isEmpty) return null;

    final lat = _extractCoordinate(data['GPS GPSLatitude'], data['GPS GPSLatitudeRef']);
    final lon = _extractCoordinate(data['GPS GPSLongitude'], data['GPS GPSLongitudeRef']);

    if (lat != null && lon != null) {
      return {'latitude': lat, 'longitude': lon};
    }
    return null;
  }

  double? _extractCoordinate(IfdTag? tag, IfdTag? ref) {
    if (tag == null || ref == null) return null;
    final List<dynamic> values = tag.values.toList();
    if (values.length < 3) return null;

    // Values are degrees, minutes, seconds as Rational objects
    double degrees = _toDouble(values[0]);
    double minutes = _toDouble(values[1]);
    double seconds = _toDouble(values[2]);

    double coordinate = degrees + (minutes / 60.0) + (seconds / 3600.0);
    if (ref.printable == 'S' || ref.printable == 'W') {
      coordinate = -coordinate;
    }
    return coordinate;
  }

  double _toDouble(dynamic rational) {
    if (rational is double) return rational;
    if (rational is int) return rational.toDouble();
    try {
      // exif package Rational objects have numerator and denominator
      return rational.numerator / rational.denominator;
    } catch (e) {
      return 0.0;
    }
  }
}
