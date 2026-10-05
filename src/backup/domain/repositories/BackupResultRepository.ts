import type { BackupResult, DriverType, Status } from '../entities/BackupResult.js';

export abstract class BackupResultRepository {
  abstract create(result: BackupResult): Promise<string>;
  abstract getAll(): Promise<BackupResult[]>;
  abstract find(limit: number, status?: Status, driver?: DriverType): Promise<BackupResult[]>;
}
