import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiConfig {
  // baseUrl is read from .env file
  static final String baseUrl = dotenv.get('API_BASE_URL', fallback: 'http://10.0.2.2:5000/api');
  
  static String get reportsUrl => '$baseUrl/reports';
  static String get nearbyReportsUrl => '$baseUrl/reports/nearby';
  static String get statsUrl => '$baseUrl/reports/stats';
}
