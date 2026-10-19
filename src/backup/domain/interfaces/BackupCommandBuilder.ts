import type { CommandSpec } from '../../../shared/domain/interfaces/CommandExecutor.js';
import type { DatabaseConnectionProps } from '../../../shared/domain/value-objects/ConnectionConfig.js';

export abstract class BackupCommandBuilder {
  abstract buildBackupCommandSpec(config: DatabaseConnectionProps, filePath: string): CommandSpec;
}
