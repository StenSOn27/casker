import type { BackupResult } from '../entities/BackupResult.js';
import type { DatabaseConnectionProps } from '../value-objects/ConnectionConfig.js';

export abstract class BackupEngine {
  abstract backup(config: DatabaseConnectionProps): Promise<BackupResult>;
}
