import type { BackupResult } from '../entities/BackupResult.js';

export abstract class BackupResultRepository {
  abstract save(result: BackupResult): string;
}
