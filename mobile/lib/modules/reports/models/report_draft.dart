import 'package:hive/hive.dart';

part 'report_draft.g.dart';

@HiveType(typeId: 0)
class ReportDraft extends HiveObject {
  @HiveField(0)
  late String category;

  @HiveField(1)
  late String description;

  @HiveField(2)
  late String imagePath;

  @HiveField(3)
  late double latitude;

  @HiveField(4)
  late double longitude;

  @HiveField(5)
  late DateTime timestamp;

  @HiveField(6)
  late bool isSynced;

  @HiveField(7)
  late String citizenPhone;

  ReportDraft({
    required this.category,
    required this.description,
    required this.imagePath,
    required this.latitude,
    required this.longitude,
    required this.timestamp,
    required this.citizenPhone,
    this.isSynced = false,
  });
}
