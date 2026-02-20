class ApiConfig {
  // Use 10.0.2.2 for Android Emulator
  // Use localhost for iOS Simulator
  // Use your machine's local IP (e.g., 192.168.1.3) for physical devices
  static const String baseUrl = 'http://192.168.1.3:5000/api';
  
  static String get reportsUrl => '$baseUrl/reports';
  static String get statsUrl => '$baseUrl/reports/stats';
}
