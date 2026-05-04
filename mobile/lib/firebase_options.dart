import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'dummy-api-key',
    appId: 'dummy-app-id',
    messagingSenderId: 'dummy-sender-id',
    projectId: 'dummy-project-id',
    authDomain: 'dummy-auth-domain',
    storageBucket: 'dummy-storage-bucket',
    measurementId: 'dummy-measurement-id',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'dummy-api-key',
    appId: 'dummy-app-id',
    messagingSenderId: 'dummy-sender-id',
    projectId: 'dummy-project-id',
    storageBucket: 'dummy-storage-bucket',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'dummy-api-key',
    appId: 'dummy-app-id',
    messagingSenderId: 'dummy-sender-id',
    projectId: 'dummy-project-id',
    storageBucket: 'dummy-storage-bucket',
    iosBundleId: 'com.example.civicConnect',
  );
}
