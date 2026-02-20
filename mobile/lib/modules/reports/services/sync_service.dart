import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:workmanager/workmanager.dart';
import 'package:hive/hive.dart';
import 'package:path_provider/path_provider.dart';
import 'package:http/http.dart' as http;
import '../../../config/api_config.dart';
import '../models/report_draft.dart';

void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    try {
      final appDocumentDir = await getApplicationDocumentsDirectory();
      Hive.init(appDocumentDir.path);
      if (!Hive.isAdapterRegistered(0)) Hive.registerAdapter(ReportDraftAdapter());
      
      final box = await Hive.openBox<ReportDraft>('report_drafts');
      final unsyncedReports = box.values.where((report) => !report.isSynced).toList();

      for (var report in unsyncedReports) {
        try {
          debugPrint("Background sync starting for: ${report.category}");
          
          var request = http.MultipartRequest('POST', Uri.parse(ApiConfig.reportsUrl));
          request.fields['category'] = report.category;
          request.fields['description'] = report.description;
          request.fields['latitude'] = report.latitude.toString();
          request.fields['longitude'] = report.longitude.toString();
          request.fields['citizen_phone'] = report.citizenPhone;
          
          if (await File(report.imagePath).exists()) {
            request.files.add(await http.MultipartFile.fromPath('image', report.imagePath));
            
            var response = await request.send();
            if (response.statusCode == 201) {
              report.isSynced = true;
              await report.save();
              debugPrint("Sync success for ${report.category}");
            }
          }
        } catch (e) {
          debugPrint("Sync failed for individual report: $e");
        }
      }
    } catch (e) {
      debugPrint("Sync task failed: $e");
    }
    return Future.value(true);
  });
}

class SyncService {
  static final _workmanager = Workmanager();

  static void initialize() {
    _workmanager.initialize(
      callbackDispatcher,
    );
  }

  static void scheduleSync() {
    _workmanager.registerOneOffTask(
      "sync-reports",
      "syncTask",
      constraints: Constraints(
        networkType: NetworkType.connected,
      ),
    );
  }
}
