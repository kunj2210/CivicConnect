import 'package:geolocator/geolocator.dart';
import 'package:flutter/foundation.dart';
import 'package:exif/exif.dart';

class LocationService {
  Future<Position?> getCurrentLocation({int timeoutSeconds = 25}) async {
    try {
      bool serviceEnabled;
      LocationPermission permission;

      // Check if location services are enabled.
      serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        return null;
      }

      permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return null;
        }
      }
      
      if (permission == LocationPermission.deniedForever) {
        return null;
      } 

      // Get current position
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: Duration(seconds: timeoutSeconds),
      );
    } catch (e) {
      debugPrint("Location acquisition failed: $e");
      return null;
    }
  }

  /// Reads EXIF metadata from image bytes.
  Future<Map<String, double>?> getExifLocation(Uint8List imageBytes) async {
    try {
      final data = await readExifFromBytes(imageBytes);

      if (data.isEmpty) return null;

      final lat = _extractCoordinate(data['GPS GPSLatitude'], data['GPS GPSLatitudeRef']);
      final lon = _extractCoordinate(data['GPS GPSLongitude'], data['GPS GPSLongitudeRef']);

      if (lat != null && lon != null) {
        return {'latitude': lat, 'longitude': lon};
      }
      return null;
    } catch (e) {
      debugPrint("Error reading EXIF data: $e");
      return null;
    }
  }

  double? _extractCoordinate(IfdTag? tag, IfdTag? ref) {
    if (tag == null || ref == null) return null;
    final List<dynamic> values = tag.values.toList();
    if (values.length < 3) return null;

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
      return rational.numerator / rational.denominator;
    } catch (e) {
      return 0.0;
    }
  }
}
