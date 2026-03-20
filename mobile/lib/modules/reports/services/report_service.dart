import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../config/api_config.dart';

class ReportService {
  Future<Map<String, dynamic>> getReportById(String reportId) async {
    final response = await http.get(Uri.parse('${ApiConfig.reportsUrl}/$reportId'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load report detail');
    }
  }

  Future<void> upvoteReport(String reportId, String identifier) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.reportsUrl}/$reportId/upvote'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'identifier': identifier}),
    );
    if (response.statusCode != 200) {
      final error = json.decode(response.body)['error'] ?? 'Failed to upvote';
      throw Exception(error);
    }
  }

  Future<void> confirmResolution(String reportId, int rating) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.reportsUrl}/$reportId/confirm-resolution'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'feedback_rating': rating}),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to confirm resolution');
    }
  }
}
