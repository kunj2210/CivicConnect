import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      throw UnsupportedError('DefaultFirebaseOptions have not been configured for web');
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        throw UnsupportedError('DefaultFirebaseOptions are not supported for this platform.');
    }
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyAyQrTQsh4Tu7Ayv4jrTHQVkAPxCjFQtjM',
    appId: '1:186214489620:android:82339eaa3018e5a5a81101',
    messagingSenderId: '186214489620',
    projectId: 'civicconnect-7c316',
    storageBucket: 'civicconnect-7c316.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'placeholder',
    appId: 'placeholder',
    messagingSenderId: 'placeholder',
    projectId: 'placeholder',
    storageBucket: 'placeholder',
    iosBundleId: 'placeholder',
  );
}
