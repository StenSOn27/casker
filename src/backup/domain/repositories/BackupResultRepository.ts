import type { BackupResult } from '../entities/BackupResult.js';

abstract class BackupResultRepository {
  abstract save(result: BackupResult): string;
}
