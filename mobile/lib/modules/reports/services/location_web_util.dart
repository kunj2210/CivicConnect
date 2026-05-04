import 'dart:async';
import 'dart:js_interop';
import 'package:location/location.dart';
import 'package:flutter/foundation.dart';

@JS('navigator.geolocation.getCurrentPosition')
external void _getCurrentPosition(JSFunction success, JSFunction error);

Future<LocationData?> getWebLocation() async {
  final completer = Completer<LocationData?>();

  final successCallback = (JSObject pos) {
    final coords = (pos as dynamic).coords;
    completer.complete(LocationData.fromMap({
      'latitude': coords.latitude,
      'longitude': coords.longitude,
      'accuracy': coords.accuracy,
      'altitude': coords.altitude,
      'speed': coords.speed,
      'heading': coords.heading,
      'time': (pos as dynamic).timestamp.toDouble(),
    }));
  }.toJS;

  final errorCallback = (JSObject err) {
    completer.complete(null);
  }.toJS;

  try {
    _getCurrentPosition(successCallback, errorCallback);
  } catch (e) {
    completer.complete(null);
  }

  return completer.future;
}
