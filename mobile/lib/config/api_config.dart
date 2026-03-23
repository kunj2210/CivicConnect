import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ApiConfig {
  // baseUrl is read from .env file
  static final String baseUrl = dotenv.get('API_BASE_URL', fallback: 'http://10.0.2.2:5000/api');
  
  static String get reportsUrl => '$baseUrl/reports';
  static String get nearbyReportsUrl => '$baseUrl/reports/nearby';
  static String get statsUrl => '$baseUrl/reports/stats';
  static String get usersUrl => '$baseUrl/users';
  static String get leaderboardUrl => '$baseUrl/users/leaderboard';


  static Map<String, String> getHeaders({bool includeContentType = true}) {
    final session = Supabase.instance.client.auth.currentSession;
    final token = session?.accessToken;
    
    return {
      if (includeContentType) 'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

}

