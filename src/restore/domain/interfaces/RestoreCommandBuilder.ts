import type { CommandSpec } from '../../../shared/domain/interfaces/CommandExecutor.js';
import type { DatabaseConnectionProps } from '../../../shared/domain/value-objects/ConnectionConfig.js';

export abstract class RestoreCommandBuilder<T extends DatabaseConnectionProps> {
  abstract buildRestoreCommandSpec(config: T, filePath: string): CommandSpec;
}
