import { BackupResult } from '../../../domain/entities/BackupResult.js';
import type { DriverType, Status } from '../../../domain/entities/BackupResult.js';
import { BackupResultModel } from '../entities/BackupResultModel.js';

export class BackupResultMapper {
  static toDomain(model: BackupResultModel): BackupResult {
    return BackupResult.reconstitute(
      model.id,
      model.driverType as DriverType,
      model.filePath,
      model.sizeBytes,
      model.status as Status,
      model.created_at,
      model.errorMessage,
    );
  }

  static toOrm(entity: BackupResult): BackupResultModel {
    const model = new BackupResultModel();
    model.id = entity.getId();
    model.driverType = entity.getDriverType();
    model.filePath = entity.getFilePath();
    model.sizeBytes = entity.getSizeBytes();
    model.status = entity.getStatus();
    model.errorMessage = entity.getErrorMessage();
    model.created_at = entity.getCreatedAt();
    return model;
  }
}
