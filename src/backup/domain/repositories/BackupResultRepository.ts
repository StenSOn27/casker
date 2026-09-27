import type { BackupResult } from '../entities/BackupResult.js';

export abstract class BackupResultRepository {
  abstract create(result: BackupResult): Promise<string>;
  abstract getAll(): Promise<BackupResult[]>;
}
