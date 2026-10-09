import type { CommandExecutor } from '../../../shared/domain/interfaces/CommandExecutor.js';
import type { DatabaseConnectionProps } from '../../../shared/domain/value-objects/ConnectionConfig.js';

export abstract class RestoreEngine<T extends DatabaseConnectionProps = DatabaseConnectionProps> {
  constructor(protected executor: CommandExecutor) {}
  abstract restore(config: T, backupFilePath: string): Promise<void>;
}
