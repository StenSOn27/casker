import type { BackupResult } from '../entities/BackupResult.js';
import type { DatabaseConnectionProps } from '../value-objects/ConnectionConfig.js';
import type { CommandExecutor } from './CommandExecutor.js';

export abstract class BackupEngine<T extends DatabaseConnectionProps = DatabaseConnectionProps> {
  constructor(protected executor: CommandExecutor) {}
  abstract backup(config: T, outputDir: string): Promise<BackupResult>;
}
