import type { CommandExecutor } from '../../../shared/domain/interfaces/CommandExecutor.js';
import type { BackupResult, DriverType } from '../entities/BackupResult.js';
import type { DatabaseConnectionProps } from '../../../shared/domain/value-objects/ConnectionConfig.js';
import type { BackupCommandBuilder } from './BackupCommandBuilder.js';

export abstract class BackupEngine<T extends DatabaseConnectionProps = DatabaseConnectionProps> {
  constructor(
    protected executor: CommandExecutor,
    protected builder: BackupCommandBuilder,
  ) {}
  abstract backup(config: T, outputDir: string): Promise<BackupResult>;

  protected buildBackupFileName(type: DriverType, database: string, at: Date): string {
    return `${type}-${database}-${at.toISOString().replace(/[:.]/g, '-')}.dump`;
  }
}
