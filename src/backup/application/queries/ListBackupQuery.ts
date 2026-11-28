import type { DriverType } from '../../../shared/domain/value-objects/ConnectionConfig.js';
import type { Status } from '../../domain/entities/BackupResult.js';

export interface ListBackupQuery {
  limit: number;
  status?: Status | undefined;
  driver?: DriverType | undefined;
  all?: boolean | undefined;
}

export interface BackupListItem {
  id: string;
  driverType: DriverType;
  filePath: string;
  sizeBytes: number;
  status: Status;
  name: string;
  createdAt: Date;
  errorMessage?: string | undefined;
}
