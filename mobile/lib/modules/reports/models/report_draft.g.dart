// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'report_draft.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class ReportDraftAdapter extends TypeAdapter<ReportDraft> {
  @override
  final int typeId = 0;

  @override
  ReportDraft read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return ReportDraft(
      category: fields[0] as String,
      description: fields[1] as String,
      imagePath: fields[2] as String,
      latitude: fields[3] as double,
      longitude: fields[4] as double,
      timestamp: fields[5] as DateTime,
      citizenPhone: fields[7] as String,
      isSynced: fields[6] as bool,
    );
  }

  @override
  void write(BinaryWriter writer, ReportDraft obj) {
    writer
      ..writeByte(8)
      ..writeByte(0)
      ..write(obj.category)
      ..writeByte(1)
      ..write(obj.description)
      ..writeByte(2)
      ..write(obj.imagePath)
      ..writeByte(3)
      ..write(obj.latitude)
      ..writeByte(4)
      ..write(obj.longitude)
      ..writeByte(5)
      ..write(obj.timestamp)
      ..writeByte(6)
      ..write(obj.isSynced)
      ..writeByte(7)
      ..write(obj.citizenPhone);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ReportDraftAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
