import type { CommandSpec } from '../../../shared/domain/interfaces/CommandExecutor.js';
import type { DatabaseConnectionProps } from '../../../shared/domain/value-objects/ConnectionConfig.js';

export abstract class ConnectionCommandBuilder<T extends DatabaseConnectionProps> {
  abstract buildConnectionCommandSpec(config: T, filePath: string): CommandSpec;
}
